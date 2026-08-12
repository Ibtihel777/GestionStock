using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class SignalementService
{
    private readonly ISignalementRepository _repository;

    public SignalementService(ISignalementRepository repository)
    {
        _repository = repository;
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
            signalement.Statut = StatutSignalement.Traite;
            await _repository.UpdateAsync(signalement);
        }

        return true;
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
