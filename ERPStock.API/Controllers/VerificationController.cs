using ERPStock.Application.DTOs;
using ERPStock.Application.Services;
using ERPStock.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/verification")]
public class VerificationController : ControllerBase
{
    private const long MaxPhotoSize = 10 * 1024 * 1024;
    private readonly VerificationStockService _service;
    private readonly ILogger<VerificationController> _logger;

    public VerificationController(
        VerificationStockService service,
        ILogger<VerificationController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] int articleId,
        [FromForm] int emplacementId,
        [FromForm] IFormFile? photo,
        CancellationToken cancellationToken)
    {
        try
        {
            if (photo is null || photo.Length == 0)
                return BadRequest(new { message = "Une photo est requise." });
            if (photo.Length > MaxPhotoSize)
                return BadRequest(new { message = "La photo ne doit pas dépasser 10 Mo." });
            if (!photo.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Le fichier doit être une image." });

            await using var stream = photo.OpenReadStream();
            await using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer, cancellationToken);

            var verification = await _service.CreateAsync(new CreateVerificationStockDto
            {
                ArticleId = articleId,
                EmplacementId = emplacementId,
                Photo = buffer.ToArray(),
                PhotoContentType = photo.ContentType
            }, cancellationToken);

            return Created($"api/verification/{verification.Id}", verification);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
        catch (GeminiApiException exception)
        {
            _logger.LogWarning(
                "Gemini a refusé la demande avec le statut {StatusCode}. Réponse fournisseur : {ProviderResponse}",
                (int?)exception.StatusCode,
                exception.ProviderResponse);
            return StatusCode((int?)exception.StatusCode ?? StatusCodes.Status502BadGateway, new { message = exception.Message });
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(exception, "La requête vers Gemini a échoué.");
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "La connexion à Gemini a échoué. Réessayez dans quelques instants." });
        }
    }
}
