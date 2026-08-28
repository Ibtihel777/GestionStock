using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class MouvementStockService
{
    private readonly IMouvementStockRepository _repository;
    private readonly IArticleRepository _articleRepository;
    private readonly IEmplacementRepository _emplacementRepository;
    private readonly IStockRepository _stockRepository;

    public MouvementStockService(
        IMouvementStockRepository repository,
        IArticleRepository articleRepository,
        IEmplacementRepository emplacementRepository,
        IStockRepository stockRepository)
    {
        _repository = repository;
        _articleRepository = articleRepository;
        _emplacementRepository = emplacementRepository;
        _stockRepository = stockRepository;
    }

    public async Task<List<MouvementStockDto>> GetAllAsync()
    {
        var mouvements = await _repository.GetAllAsync();
        return mouvements.Select(ToDto).ToList();
    }

    public async Task<MouvementStockDto?> GetByIdAsync(int id)
    {
        var mouvement = await _repository.GetByIdAsync(id);
        return mouvement is null ? null : ToDto(mouvement);
    }

    public async Task<MouvementStockDto> CreateAsync(CreateMouvementStockDto dto)
    {
        return dto.Type == TypeMouvementStock.Entree
            ? await EnregistrerEntreeStockAsync(dto)
            : await EnregistrerMouvementAsync(dto);
    }

    // Une entrée est le seul mouvement qui modifie le coût moyen de l'article.
    // Le repository enregistre l'article suivi, le stock et le mouvement dans
    // la même transaction.
    public async Task<MouvementStockDto> EnregistrerEntreeStockAsync(CreateMouvementStockDto dto)
    {
        if (dto.Type != TypeMouvementStock.Entree)
            throw new ArgumentException("Cette méthode est réservée aux entrées de stock.");

        Validate(dto);
        var article = await GetValidatedArticleAsync(dto.ArticleId);
        await ValidateEmplacementsAsync(dto);

        var ancienneQuantite = await _stockRepository.GetTotalQuantityByArticleAsync(dto.ArticleId);
        if (article.ModeGestion == "CMUP")
        {
            article.CMUP = CalculateCmup(
                ancienneQuantite,
                article.CMUP,
                dto.Quantite,
                dto.PrixUnitaireEntree!.Value);
        }

        return ToDto(await _repository.RecordAsync(CreateMovement(dto), article.ModeGestion, article.CMUP));
    }

    private async Task<MouvementStockDto> EnregistrerMouvementAsync(CreateMouvementStockDto dto)
    {
        Validate(dto);
        var article = await GetValidatedArticleAsync(dto.ArticleId);
        await ValidateEmplacementsAsync(dto);

        // Une sortie ou un transfert ne modifie jamais le CMUP.
        return ToDto(await _repository.RecordAsync(CreateMovement(dto), article.ModeGestion, article.CMUP));
    }

    private async Task<Article> GetValidatedArticleAsync(int articleId)
    {
        var article = await _articleRepository.GetByIdAsync(articleId);
        return article ?? throw new ArgumentException("L'article sélectionné n'existe pas.");
    }

    private async Task ValidateEmplacementsAsync(CreateMouvementStockDto dto)
    {
        if (dto.EmplacementSourceId.HasValue && await _emplacementRepository.GetByIdAsync(dto.EmplacementSourceId.Value) is null)
            throw new ArgumentException("L'emplacement source sélectionné n'existe pas.");

        if (dto.EmplacementDestinationId.HasValue && await _emplacementRepository.GetByIdAsync(dto.EmplacementDestinationId.Value) is null)
            throw new ArgumentException("L'emplacement destination sélectionné n'existe pas.");
    }

    private static MouvementStock CreateMovement(CreateMouvementStockDto dto) => new()
    {
        Type = dto.Type,
        Quantite = dto.Quantite,
        PrixUnitaireEntree = dto.PrixUnitaireEntree,
        ArticleId = dto.ArticleId,
        EmplacementSourceId = dto.EmplacementSourceId,
        EmplacementDestinationId = dto.EmplacementDestinationId,
        DateMouvement = DateTime.UtcNow
    };

    private static void Validate(CreateMouvementStockDto dto)
    {
        if (dto.Quantite <= 0)
            throw new ArgumentException("La quantité doit être supérieure à zéro.");

        switch (dto.Type)
        {
            case TypeMouvementStock.Entree when !dto.EmplacementDestinationId.HasValue || dto.EmplacementSourceId.HasValue:
                throw new ArgumentException("Une entrée exige uniquement un emplacement de destination.");
            case TypeMouvementStock.Entree when !dto.PrixUnitaireEntree.HasValue || dto.PrixUnitaireEntree <= 0:
                throw new ArgumentException("Une entrée exige un prix unitaire supérieur à zéro.");
            case TypeMouvementStock.Sortie when !dto.EmplacementSourceId.HasValue || dto.EmplacementDestinationId.HasValue:
                throw new ArgumentException("Une sortie exige uniquement un emplacement source.");
            case TypeMouvementStock.Sortie or TypeMouvementStock.Transfert when dto.PrixUnitaireEntree.HasValue:
                throw new ArgumentException("Le prix unitaire est renseigné uniquement pour une entrée.");
            case TypeMouvementStock.Transfert when !dto.EmplacementSourceId.HasValue || !dto.EmplacementDestinationId.HasValue:
                throw new ArgumentException("Un transfert exige un emplacement source et un emplacement destination.");
            case TypeMouvementStock.Transfert when dto.EmplacementSourceId == dto.EmplacementDestinationId:
                throw new ArgumentException("Les emplacements source et destination doivent être différents.");
            case not (TypeMouvementStock.Entree or TypeMouvementStock.Sortie or TypeMouvementStock.Transfert):
                throw new ArgumentException("Le type de mouvement est invalide.");
        }
    }

    internal static decimal CalculateCmup(int previousQuantity, decimal previousCmup, int entryQuantity, decimal entryUnitPrice)
    {
        var totalQuantity = previousQuantity + entryQuantity;
        return ((previousQuantity * previousCmup) + (entryQuantity * entryUnitPrice)) / totalQuantity;
    }

    private static MouvementStockDto ToDto(MouvementStock mouvement) => new()
    {
        Id = mouvement.Id,
        Type = mouvement.Type,
        DateMouvement = mouvement.DateMouvement,
        Quantite = mouvement.Quantite,
        PrixUnitaireEntree = mouvement.PrixUnitaireEntree,
        PrixUnitaireSortie = mouvement.PrixUnitaireSortie,
        ArticleId = mouvement.ArticleId,
        ArticleReference = mouvement.Article.Reference,
        EmplacementSourceId = mouvement.EmplacementSourceId,
        CodeEmplacementSource = mouvement.EmplacementSource?.Code_Emplacement,
        EmplacementDestinationId = mouvement.EmplacementDestinationId,
        CodeEmplacementDestination = mouvement.EmplacementDestination?.Code_Emplacement
    };
}
