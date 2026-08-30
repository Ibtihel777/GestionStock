using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class ArticleService
{
    private readonly IArticleRepository _repository;
    private readonly IFamilleArticleRepository _familleRepository;
    private readonly IEmplacementRepository _emplacementRepository;

    public ArticleService(
        IArticleRepository repository,
        IFamilleArticleRepository familleRepository,
        IEmplacementRepository emplacementRepository)
    {
        _repository = repository;
        _familleRepository = familleRepository;
        _emplacementRepository = emplacementRepository;
    }

    public async Task<List<ArticleDto>> GetAllAsync() => (await _repository.GetAllAsync()).Select(ToDto).ToList();

    public async Task<ArticleDto?> GetByIdAsync(int id)
    {
        var article = await _repository.GetByIdAsync(id);
        return article is null ? null : ToDto(article);
    }

    public async Task<ArticleDto> CreateAsync(CreateArticleDto dto)
    {
        ValidateModeGestion(dto.ModeGestion);
        ValidateSeuilMinimum(dto.SeuilMinimum);
        await ValidateFamilleAsync(dto.FamilleArticleId);
        await ValidateInitialStockAsync(dto);
        var article = new Article
        {
            Reference = dto.Reference,
            Designation = dto.Designation,
            ModeGestion = dto.ModeGestion,
            FamilleArticleId = dto.FamilleArticleId,
            Type = dto.Type,
            SuiviStock = dto.SuiviStock,
            CMUP = dto.CMUP,
            UniteMesure = NormalizeUniteMesure(dto.UniteMesure),
            SeuilMinimum = dto.SeuilMinimum,
            DateCreation = DateTime.UtcNow
        };

        if (dto.InitialStockQuantity > 0)
            await _repository.AddWithInitialStockAsync(article, dto.InitialStockQuantity, dto.InitialStockEmplacementId!.Value);
        else
            await _repository.AddAsync(article);
        return ToDto(await _repository.GetByIdAsync(article.Id) ?? article);
    }

    public async Task<bool> UpdateAsync(int id, CreateArticleDto dto)
    {
        var article = await _repository.GetByIdAsync(id);
        if (article is null) return false;

        ValidateModeGestion(dto.ModeGestion);
        ValidateSeuilMinimum(dto.SeuilMinimum);
        await ValidateFamilleAsync(dto.FamilleArticleId);
        article.Reference = dto.Reference;
        article.Designation = dto.Designation;
        article.ModeGestion = dto.ModeGestion;
        article.FamilleArticleId = dto.FamilleArticleId;
        article.Type = dto.Type;
        article.SuiviStock = dto.SuiviStock;
        article.CMUP = dto.CMUP;
        article.UniteMesure = NormalizeUniteMesure(dto.UniteMesure);
        article.SeuilMinimum = dto.SeuilMinimum;

        await _repository.UpdateAsync(article);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task ValidateFamilleAsync(int familleArticleId)
    {
        if (familleArticleId <= 0 || await _familleRepository.GetByIdAsync(familleArticleId) is null)
            throw new ArgumentException("La famille sélectionnée n'existe pas.");
    }

    private async Task ValidateInitialStockAsync(CreateArticleDto dto)
    {
        if (dto.InitialStockQuantity < 0)
            throw new ArgumentException("La quantité initiale ne peut pas être négative.");
        if (dto.InitialStockQuantity == 0) return;
        if (!dto.InitialStockEmplacementId.HasValue
            || await _emplacementRepository.GetByIdAsync(dto.InitialStockEmplacementId.Value) is null)
            throw new ArgumentException("Sélectionnez un emplacement valide pour le stock initial.");
        if (dto.CMUP <= 0)
            throw new ArgumentException("Le CMUP doit être supérieur à zéro lorsqu'un stock initial est renseigné.");
    }

    private static void ValidateModeGestion(string modeGestion)
    {
        if (modeGestion is not ("FIFO" or "LIFO" or "CMUP"))
            throw new ArgumentException("Le mode de gestion doit etre FIFO, LIFO ou CMUP.");
    }

    private static void ValidateSeuilMinimum(int seuilMinimum)
    {
        if (seuilMinimum < 0)
            throw new ArgumentException("Le seuil minimum ne peut pas être négatif.");
    }

    private static string NormalizeUniteMesure(string uniteMesure)
    {
        var uniteNormalisee = string.IsNullOrWhiteSpace(uniteMesure) ? "Unit\u00e9" : uniteMesure.Trim();
        if (uniteNormalisee.Length > 30)
            throw new ArgumentException("L’unité de mesure ne peut pas dépasser 30 caractères.");
        return uniteNormalisee;
    }

    private static ArticleDto ToDto(Article article) => new()
    {
        Id = article.Id,
        Reference = article.Reference,
        Designation = article.Designation,
        ModeGestion = article.ModeGestion,
        FamilleArticleId = article.FamilleArticleId,
        FamilleReference = article.FamilleArticle?.Reference ?? string.Empty,
        FamilleNom = article.FamilleArticle?.Nom ?? string.Empty,
        Type = article.Type,
        SuiviStock = article.SuiviStock,
        CMUP = article.CMUP,
        UniteMesure = article.UniteMesure,
        SeuilMinimum = article.SeuilMinimum,
        QuantiteEnStock = article.Stocks.Sum(stock => stock.Quantite),
        DateCreation = article.DateCreation
    };
}
