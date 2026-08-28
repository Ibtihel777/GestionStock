using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IDepotRepository
{
    Task<List<Depot>> GetAllAsync();
    Task<Depot?> GetByIdAsync(int id);
    Task AddAsync(Depot depot);
    Task UpdateAsync(Depot depot);
    Task DeleteAsync(int id);
}
