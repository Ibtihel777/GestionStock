using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class SignalementService
{
    private readonly ISignalementRepository _repository;
    private readonly IMouvementStockRepository _mouvementRepository;

    public SignalementService(
        ISignalementRepository repository,
        IMouvementStockRepository mouvementRepository)
    {
        _repository = repository;
        _mouvementRepository = mouvementRepository;
    }

    public async Task<List<SignalementDto>> GetAllAsync()
    {
        return (await _repository.GetAllAsync()).Select(ToDto).ToList();
    }

    public async Task<bool> MarkAsProcessedAsync(int id)
    {
        var signalement = await _repository.GetByIdAsync(id);
        if (signalement is null)
            return false;

        if (signalement.Statut != StatutSignalement.Traite)
        {
            await ApplyStockAdjustmentAsync(signalement);
            signalement.Statut = StatutSignalement.Traite;
            await _repository.UpdateAsync(signalement);
        }

        return true;
    }

    private async Task ApplyStockAdjustmentAsync(Signalement signalement)
    {
        if (signalement.Ecart == 0)
            return;

        var mouvement = new MouvementStock
        {
            Type = signalement.Ecart > 0 ? TypeMouvementStock.Entree : TypeMouvementStock.Sortie,
            Quantite = Math.Abs(signalement.Ecart),
            ArticleId = signalement.ArticleId,
            EmplacementSourceId = signalement.Ecart < 0 ? signalement.EmplacementId : null,
            EmplacementDestinationId = signalement.Ecart > 0 ? signalement.EmplacementId : null,
            DateMouvement = DateTime.UtcNow
        };

        await _mouvementRepository.RecordAsync(mouvement);
    }

    private static SignalementDto ToDto(Signalement signalement) => new()
    {
        Id = signalement.Id,
        DateSignalement = signalement.DateSignalement,
        QuantiteTheorique = signalement.QuantiteTheorique,
        QuantiteDetectee = signalement.QuantiteDetectee,
        Ecart = signalement.Ecart,
        Statut = signalement.Statut.ToString(),
        SignalePar = signalement.SignalePar,
        ArticleId = signalement.ArticleId,
        ArticleReference = signalement.Article.Reference,
        ArticleDesignation = signalement.Article.Designation,
        EmplacementId = signalement.EmplacementId,
        CodeEmplacement = signalement.Emplacement.Code_Emplacement
    };
}
