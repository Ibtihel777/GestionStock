using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class FamilleArticleService
{
    private readonly IFamilleArticleRepository _repository;

    public FamilleArticleService(IFamilleArticleRepository repository) => _repository = repository;

    public async Task<List<FamilleArticleDto>> GetAllAsync() => (await _repository.GetAllAsync()).Select(ToDto).ToList();

    public async Task<FamilleArticleDto?> GetByIdAsync(int id)
    {
        var famille = await _repository.GetByIdAsync(id);
        return famille is null ? null : ToDto(famille);
    }

    public async Task<FamilleArticleDto> CreateAsync(CreateFamilleArticleDto dto)
    {
        var (reference, nom) = Normalize(dto.Reference, dto.Nom);
        await ValidateParentAsync(dto.FamilleParentId);
        var famille = new FamilleArticle { Reference = reference, Nom = nom, FamilleParentId = dto.FamilleParentId };
        await _repository.AddAsync(famille);
        return ToDto(famille);
    }

    public async Task<bool> UpdateAsync(int id, CreateFamilleArticleDto dto)
    {
        var famille = await _repository.GetByIdAsync(id);
        if (famille is null) return false;

        var (reference, nom) = Normalize(dto.Reference, dto.Nom);
        await ValidateParentAsync(dto.FamilleParentId, id);
        famille.Reference = reference;
        famille.Nom = nom;
        famille.FamilleParentId = dto.FamilleParentId;
        await _repository.UpdateAsync(famille);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task ValidateParentAsync(int? parentId, int? familleId = null)
    {
        if (!parentId.HasValue) return;
        if (parentId == familleId) throw new ArgumentException("Une famille ne peut pas être son propre parent.");

        var current = await _repository.GetByIdAsync(parentId.Value)
            ?? throw new ArgumentException("La famille parente sélectionnée n'existe pas.");
        while (current.FamilleParentId.HasValue)
        {
            if (current.FamilleParentId == familleId)
                throw new ArgumentException("Une famille ne peut pas être rattachée à l'une de ses descendantes.");
            current = await _repository.GetByIdAsync(current.FamilleParentId.Value)
                ?? throw new InvalidOperationException("La hiérarchie des familles est invalide.");
        }
    }

    private static (string Reference, string Nom) Normalize(string? referenceValue, string? nomValue)
    {
        var nom = nomValue?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nom))
            throw new ArgumentException("Le nom de la famille est obligatoire.");

        return (referenceValue?.Trim() ?? string.Empty, nom);
    }

    private static FamilleArticleDto ToDto(FamilleArticle famille) => new()
    {
        Id = famille.Id,
        Reference = famille.Reference,
        Nom = famille.Nom,
        FamilleParentId = famille.FamilleParentId,
        ReferenceFamilleParent = famille.FamilleParent?.Reference
    };
}
