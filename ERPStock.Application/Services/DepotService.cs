using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class DepotService
{
    private readonly IDepotRepository _repository;

    public DepotService(IDepotRepository repository) => _repository = repository;

    public async Task<List<DepotDto>> GetAllAsync() => (await _repository.GetAllAsync()).Select(ToDto).ToList();

    public async Task<DepotDto?> GetByIdAsync(int id)
    {
        var depot = await _repository.GetByIdAsync(id);
        return depot is null ? null : ToDto(depot);
    }

    public async Task<DepotDto> CreateAsync(CreateDepotDto dto)
    {
        var (reference, nom) = Normalize(dto.Reference, dto.Nom);
        await ValidateParentAsync(dto.DepotParentId);
        var depot = new Depot { Reference = reference, Nom = nom, DepotParentId = dto.DepotParentId };
        await _repository.AddAsync(depot);
        return ToDto(depot);
    }

    public async Task<bool> UpdateAsync(int id, CreateDepotDto dto)
    {
        var depot = await _repository.GetByIdAsync(id);
        if (depot is null) return false;

        var (reference, nom) = Normalize(dto.Reference, dto.Nom);
        await ValidateParentAsync(dto.DepotParentId, id);
        depot.Reference = reference;
        depot.Nom = nom;
        depot.DepotParentId = dto.DepotParentId;
        await _repository.UpdateAsync(depot);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task ValidateParentAsync(int? parentId, int? depotId = null)
    {
        if (!parentId.HasValue) return;
        if (parentId == depotId) throw new ArgumentException("Un dépôt ne peut pas être son propre parent.");

        var current = await _repository.GetByIdAsync(parentId.Value)
            ?? throw new ArgumentException("Le dépôt parent sélectionné n'existe pas.");
        while (current.DepotParentId.HasValue)
        {
            if (current.DepotParentId == depotId)
                throw new ArgumentException("Un dépôt ne peut pas être rattaché à l'un de ses descendants.");
            current = await _repository.GetByIdAsync(current.DepotParentId.Value)
                ?? throw new InvalidOperationException("La hiérarchie des dépôts est invalide.");
        }
    }

    private static (string Reference, string Nom) Normalize(string? referenceValue, string? nomValue)
    {
        var nom = nomValue?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nom))
            throw new ArgumentException("Le nom du dépôt est obligatoire.");

        return (referenceValue?.Trim() ?? string.Empty, nom);
    }

    private static DepotDto ToDto(Depot depot) => new()
    {
        Id = depot.Id,
        Reference = depot.Reference,
        Nom = depot.Nom,
        DepotParentId = depot.DepotParentId,
        ReferenceDepotParent = depot.DepotParent?.Reference
    };
}
