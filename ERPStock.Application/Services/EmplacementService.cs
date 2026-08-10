using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class EmplacementService
{
    private readonly IEmplacementRepository _repository;

    public EmplacementService(IEmplacementRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<EmplacementDto>> GetAllAsync()
    {
        var emplacements = await _repository.GetAllAsync();
        return emplacements.Select(ToDto).ToList();
    }

    public async Task<EmplacementDto?> GetByIdAsync(int id)
    {
        var emplacement = await _repository.GetByIdAsync(id);
        return emplacement is null ? null : ToDto(emplacement);
    }

    public async Task<EmplacementDto> CreateAsync(CreateEmplacementDto dto)
    {
        var emplacement = new Emplacement
        {
            Zone = dto.Zone,
            Etagere = dto.Etagere,
            Tiroir = dto.Tiroir,
            Code_Emplacement = CreateCode(dto)
        };

        await _repository.AddAsync(emplacement);
        return ToDto(emplacement);
    }

    public async Task<bool> UpdateAsync(int id, CreateEmplacementDto dto)
    {
        var emplacement = await _repository.GetByIdAsync(id);
        if (emplacement is null) return false;

        emplacement.Zone = dto.Zone;
        emplacement.Etagere = dto.Etagere;
        emplacement.Tiroir = dto.Tiroir;
        emplacement.Code_Emplacement = CreateCode(dto);

        await _repository.UpdateAsync(emplacement);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var emplacement = await _repository.GetByIdAsync(id);
        if (emplacement is null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static string CreateCode(CreateEmplacementDto dto)
    {
        return $"{dto.Zone}-{dto.Etagere}-{dto.Tiroir}";
    }

    private static EmplacementDto ToDto(Emplacement emplacement)
    {
        return new EmplacementDto
        {
            Id = emplacement.Id,
            Zone = emplacement.Zone,
            Etagere = emplacement.Etagere,
            Tiroir = emplacement.Tiroir,
            CodeEmplacement = emplacement.Code_Emplacement
        };
    }
}
