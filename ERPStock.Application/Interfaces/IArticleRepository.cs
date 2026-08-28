using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IArticleRepository
{
    Task<List<Article>> GetAllAsync();
    Task<Article?> GetByIdAsync(int id);
    Task AddAsync(Article article);
    Task AddWithInitialStockAsync(Article article, int initialQuantity, int emplacementId);
    Task UpdateAsync(Article article);
    Task DeleteAsync(int id);
}
