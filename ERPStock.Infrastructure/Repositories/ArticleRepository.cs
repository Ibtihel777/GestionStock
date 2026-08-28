using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class ArticleRepository : IArticleRepository
{
    private readonly AppDbContext _context;

    public ArticleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Article>> GetAllAsync()
    {
        return await _context.Articles.Include(article => article.FamilleArticle).ToListAsync();
    }

    public async Task<Article?> GetByIdAsync(int id)
    {
        return await _context.Articles.Include(article => article.FamilleArticle)
            .FirstOrDefaultAsync(article => article.Id == id);
    }

    public async Task AddAsync(Article article)
    {
        _context.Articles.Add(article);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Article article)
    {
        _context.Articles.Update(article);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        await CascadeDeleteHelper.DeleteArticlesAsync(_context, [id]);
        await transaction.CommitAsync();
    }

    public async Task AddWithInitialStockAsync(Article article, int initialQuantity, int emplacementId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        _context.Articles.Add(article);
        _context.Stocks.Add(new Stock
        {
            Article = article,
            EmplacementId = emplacementId,
            Quantite = initialQuantity
        });
        _context.MouvementsStock.Add(new MouvementStock
        {
            Article = article,
            Type = TypeMouvementStock.Entree,
            Quantite = initialQuantity,
            PrixUnitaireEntree = article.CMUP,
            EmplacementDestinationId = emplacementId,
            DateMouvement = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
