using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class MouvementStockService
{
    private readonly IMouvementStockRepository _repository;
    private readonly IArticleRepository _articleRepository;
    private readonly IEmplacementRepository _emplacementRepository;

    public MouvementStockService(
        IMouvementStockRepository repository,
        IArticleRepository articleRepository,
        IEmplacementRepository emplacementRepository)
    {
        _repository = repository;
        _articleRepository = articleRepository;
        _emplacementRepository = emplacementRepository;
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
        Validate(dto);

        if (await _articleRepository.GetByIdAsync(dto.ArticleId) is null)
            throw new ArgumentException("L'article sélectionné n'existe pas.");

        if (dto.EmplacementSourceId.HasValue && await _emplacementRepository.GetByIdAsync(dto.EmplacementSourceId.Value) is null)
            throw new ArgumentException("L'emplacement source sélectionné n'existe pas.");

        if (dto.EmplacementDestinationId.HasValue && await _emplacementRepository.GetByIdAsync(dto.EmplacementDestinationId.Value) is null)
            throw new ArgumentException("L'emplacement destination sélectionné n'existe pas.");

        var mouvement = new MouvementStock
        {
            Type = dto.Type,
            Quantite = dto.Quantite,
            ArticleId = dto.ArticleId,
            EmplacementSourceId = dto.EmplacementSourceId,
            EmplacementDestinationId = dto.EmplacementDestinationId,
            DateMouvement = DateTime.UtcNow
        };

        return ToDto(await _repository.RecordAsync(mouvement));
    }

    private static void Validate(CreateMouvementStockDto dto)
    {
        if (dto.Quantite <= 0)
            throw new ArgumentException("La quantité doit être supérieure à zéro.");

        switch (dto.Type)
        {
            case TypeMouvementStock.Entree when !dto.EmplacementDestinationId.HasValue || dto.EmplacementSourceId.HasValue:
                throw new ArgumentException("Une entrée exige uniquement un emplacement de destination.");
            case TypeMouvementStock.Sortie when !dto.EmplacementSourceId.HasValue || dto.EmplacementDestinationId.HasValue:
                throw new ArgumentException("Une sortie exige uniquement un emplacement source.");
            case TypeMouvementStock.Transfert when !dto.EmplacementSourceId.HasValue || !dto.EmplacementDestinationId.HasValue:
                throw new ArgumentException("Un transfert exige un emplacement source et un emplacement destination.");
            case TypeMouvementStock.Transfert when dto.EmplacementSourceId == dto.EmplacementDestinationId:
                throw new ArgumentException("Les emplacements source et destination doivent être différents.");
            case not (TypeMouvementStock.Entree or TypeMouvementStock.Sortie or TypeMouvementStock.Transfert):
                throw new ArgumentException("Le type de mouvement est invalide.");
        }
    }

    private static MouvementStockDto ToDto(MouvementStock mouvement) => new()
    {
        Id = mouvement.Id,
        Type = mouvement.Type,
        DateMouvement = mouvement.DateMouvement,
        Quantite = mouvement.Quantite,
        ArticleId = mouvement.ArticleId,
        ArticleReference = mouvement.Article.Reference,
        EmplacementSourceId = mouvement.EmplacementSourceId,
        CodeEmplacementSource = mouvement.EmplacementSource?.Code_Emplacement,
        EmplacementDestinationId = mouvement.EmplacementDestinationId,
        CodeEmplacementDestination = mouvement.EmplacementDestination?.Code_Emplacement
    };
}
