using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class EmplacementService
{
    private readonly IEmplacementRepository _repository;
    private readonly IDepotRepository _depotRepository;

    public EmplacementService(IEmplacementRepository repository, IDepotRepository depotRepository)
    {
        _repository = repository;
        _depotRepository = depotRepository;
    }

    public async Task<List<EmplacementDto>> GetAllAsync() => (await _repository.GetAllAsync()).Select(ToDto).ToList();

    public async Task<EmplacementDto?> GetByIdAsync(int id)
    {
        var emplacement = await _repository.GetByIdAsync(id);
        return emplacement is null ? null : ToDto(emplacement);
    }

    public async Task<EmplacementDto> CreateAsync(CreateEmplacementDto dto)
    {
        await ValidateDepotAsync(dto.DepotId);
        var emplacement = new Emplacement
        {
            DepotId = dto.DepotId,
            Zone = dto.Zone,
            Etagere = dto.Etagere,
            Tiroir = dto.Tiroir,
            Code_Emplacement = CreateCode(dto)
        };

        await _repository.AddAsync(emplacement);
        return ToDto(await _repository.GetByIdAsync(emplacement.Id) ?? emplacement);
    }

    public async Task<bool> UpdateAsync(int id, CreateEmplacementDto dto)
    {
        var emplacement = await _repository.GetByIdAsync(id);
        if (emplacement is null) return false;

        await ValidateDepotAsync(dto.DepotId);
        emplacement.DepotId = dto.DepotId;
        emplacement.Zone = dto.Zone;
        emplacement.Etagere = dto.Etagere;
        emplacement.Tiroir = dto.Tiroir;
        emplacement.Code_Emplacement = CreateCode(dto);

        await _repository.UpdateAsync(emplacement);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task ValidateDepotAsync(int depotId)
    {
        if (depotId <= 0 || await _depotRepository.GetByIdAsync(depotId) is null)
            throw new ArgumentException("Le dépôt sélectionné n'existe pas.");
    }

    private static string CreateCode(CreateEmplacementDto dto) => $"{dto.Zone}-{dto.Etagere}-{dto.Tiroir}";

    private static EmplacementDto ToDto(Emplacement emplacement) => new()
    {
        Id = emplacement.Id,
        DepotId = emplacement.DepotId,
        DepotReference = emplacement.Depot?.Reference ?? string.Empty,
        DepotNom = emplacement.Depot?.Nom ?? string.Empty,
        Zone = emplacement.Zone,
        Etagere = emplacement.Etagere,
        Tiroir = emplacement.Tiroir,
        CodeEmplacement = emplacement.Code_Emplacement
    };
}
