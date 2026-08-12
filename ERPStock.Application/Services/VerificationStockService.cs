using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class VerificationStockService
{
    private readonly IVerificationStockRepository _verificationRepository;
    private readonly IArticleRepository _articleRepository;
    private readonly IEmplacementRepository _emplacementRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IVisionService _visionService;

    public VerificationStockService(
        IVerificationStockRepository verificationRepository,
        IArticleRepository articleRepository,
        IEmplacementRepository emplacementRepository,
        IStockRepository stockRepository,
        IVisionService visionService)
    {
        _verificationRepository = verificationRepository;
        _articleRepository = articleRepository;
        _emplacementRepository = emplacementRepository;
        _stockRepository = stockRepository;
        _visionService = visionService;
    }

    public async Task<List<VerificationStockDto>> GetAllAsync()
    {
        var verifications = await _verificationRepository.GetAllAsync();
        return verifications.Select(ToDto).ToList();
    }

    public async Task<VerificationStockDto> CreateAsync(
        CreateVerificationStockDto dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.Photo.Length == 0)
            throw new ArgumentException("Une photo est requise pour effectuer la vérification.");

        var article = await _articleRepository.GetByIdAsync(dto.ArticleId)
            ?? throw new ArgumentException("L'article sélectionné n'existe pas.");
        var emplacement = await _emplacementRepository.GetByIdAsync(dto.EmplacementId)
            ?? throw new ArgumentException("L'emplacement sélectionné n'existe pas.");

        var quantiteTheorique = await _stockRepository.GetQuantityByArticleAndEmplacementAsync(
            dto.ArticleId,
            dto.EmplacementId);
        var quantiteDetectee = await _visionService.CountArticlesAsync(
            dto.Photo,
            dto.PhotoContentType,
            article.Designation,
            cancellationToken);

        var verification = new VerificationStock
        {
            ArticleId = article.Id,
            EmplacementId = emplacement.Id,
            DateVerification = DateTime.UtcNow,
            QuantiteTheorique = quantiteTheorique,
            QuantiteDetectee = quantiteDetectee,
            Ecart = quantiteDetectee - quantiteTheorique
        };

        await _verificationRepository.AddAsync(verification);
        verification.Article = article;
        verification.Emplacement = emplacement;
        return ToDto(verification);
    }

    private static VerificationStockDto ToDto(VerificationStock verification) => new()
    {
        Id = verification.Id,
        DateVerification = verification.DateVerification,
        QuantiteTheorique = verification.QuantiteTheorique,
        QuantiteDetectee = verification.QuantiteDetectee,
        Ecart = verification.Ecart,
        PhotoUrl = verification.PhotoUrl,
        ArticleId = verification.ArticleId,
        ArticleReference = verification.Article.Reference,
        ArticleDesignation = verification.Article.Designation,
        EmplacementId = verification.EmplacementId,
        CodeEmplacement = verification.Emplacement.Code_Emplacement
    };
}
