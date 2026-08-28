using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IFamilleArticleRepository
{
    Task<List<FamilleArticle>> GetAllAsync();
    Task<FamilleArticle?> GetByIdAsync(int id);
    Task AddAsync(FamilleArticle famille);
    Task UpdateAsync(FamilleArticle famille);
    Task DeleteAsync(int id);
}
