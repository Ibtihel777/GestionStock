using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IStockRepository
{
    Task<List<Stock>> GetAllAsync();
    Task<Stock?> GetByIdAsync(int id);
    Task<int> GetTotalQuantityByArticleAsync(int articleId);
    Task<int> GetQuantityByArticleAndEmplacementAsync(int articleId, int emplacementId);
    Task AddAsync(Stock stock);
    Task UpdateAsync(Stock stock);
    Task DeleteAsync(int id);
}
