using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IEmplacementRepository
{
    Task<List<Emplacement>> GetAllAsync();
    Task<Emplacement?> GetByIdAsync(int id);
    Task AddAsync(Emplacement emplacement);
    Task UpdateAsync(Emplacement emplacement);
    Task DeleteAsync(int id);
}
