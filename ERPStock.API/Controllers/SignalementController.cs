using ERPStock.Application.Security;
using ERPStock.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/signalements")]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class SignalementController : ControllerBase
{
    private readonly SignalementService _service;

    public SignalementController(SignalementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPatch("{id:int}/traiter")]
    public async Task<IActionResult> MarkAsProcessed(int id)
    {
        return await _service.MarkAsProcessedAsync(id) ? NoContent() : NotFound();
    }
}
