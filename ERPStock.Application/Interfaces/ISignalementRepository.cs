using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface ISignalementRepository
{
    Task AddAsync(Signalement signalement);
    Task<List<Signalement>> GetAllAsync();
    Task<Signalement?> GetByIdAsync(int id);
    Task UpdateAsync(Signalement signalement);
}
