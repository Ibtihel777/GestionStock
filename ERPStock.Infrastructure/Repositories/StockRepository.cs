using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class StockRepository : IStockRepository
{
    private readonly AppDbContext _context;

    public StockRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Stock>> GetAllAsync()
    {
        return await _context.Stocks
            .Include(stock => stock.Article)
            .Include(stock => stock.Emplacement)
            .ToListAsync();
    }

    public async Task<Stock?> GetByIdAsync(int id)
    {
        return await _context.Stocks
            .Include(stock => stock.Article)
            .Include(stock => stock.Emplacement)
            .FirstOrDefaultAsync(stock => stock.Id == id);
    }

    public async Task<int> GetTotalQuantityByArticleAsync(int articleId)
    {
        return await _context.Stocks
            .Where(stock => stock.ArticleId == articleId)
            .SumAsync(stock => (int?)stock.Quantite) ?? 0;
    }

    public async Task<int> GetQuantityByArticleAndEmplacementAsync(int articleId, int emplacementId)
    {
        return await _context.Stocks
            .Where(stock => stock.ArticleId == articleId && stock.EmplacementId == emplacementId)
            .SumAsync(stock => (int?)stock.Quantite) ?? 0;
    }

    public async Task AddAsync(Stock stock)
    {
        var article = await _context.Articles.FindAsync(stock.ArticleId)
            ?? throw new ArgumentException("L'article selectionne n'existe pas.");
        _context.Stocks.Add(stock);
        _context.StockLots.Add(new StockLot
        {
            ArticleId = stock.ArticleId,
            EmplacementId = stock.EmplacementId,
            QuantiteRestante = stock.Quantite,
            PrixUnitaire = article.CMUP,
            DateEntree = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Stock stock)
    {
        var entry = _context.Entry(stock);
        var previousQuantity = entry.Property(item => item.Quantite).OriginalValue;
        var previousArticleId = entry.Property(item => item.ArticleId).OriginalValue;
        var previousEmplacementId = entry.Property(item => item.EmplacementId).OriginalValue;

        if (stock.Quantite < 0)
            throw new ArgumentException("La quantite de stock ne peut pas etre negative.");
        if (stock.ArticleId != previousArticleId || stock.EmplacementId != previousEmplacementId)
            throw new ArgumentException("Un ajustement ne peut pas changer l'article ou l'emplacement du stock.");

        var quantityDifference = stock.Quantite - previousQuantity;
        if (quantityDifference > 0)
        {
            var article = await _context.Articles.FindAsync(stock.ArticleId)
                ?? throw new ArgumentException("L'article selectionne n'existe pas.");
            _context.StockLots.Add(new StockLot
            {
                ArticleId = stock.ArticleId,
                EmplacementId = stock.EmplacementId,
                QuantiteRestante = quantityDifference,
                PrixUnitaire = article.CMUP,
                DateEntree = DateTime.UtcNow
            });
        }
        else if (quantityDifference < 0)
        {
            await RemoveLotsAsync(stock.ArticleId, stock.EmplacementId, -quantityDifference, stock.Article.ModeGestion);
        }

        _context.Stocks.Update(stock);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var stock = await _context.Stocks.FindAsync(id);
        if (stock is not null)
        {
            await _context.StockLots
                .Where(lot => lot.ArticleId == stock.ArticleId && lot.EmplacementId == stock.EmplacementId)
                .ExecuteDeleteAsync();
            _context.Stocks.Remove(stock);
            await _context.SaveChangesAsync();
        }
    }

    private async Task RemoveLotsAsync(int articleId, int emplacementId, int quantity, string modeGestion)
    {
        var query = _context.StockLots
            .Where(lot => lot.ArticleId == articleId && lot.EmplacementId == emplacementId && lot.QuantiteRestante > 0);
        var lots = modeGestion == "LIFO"
            ? await query.OrderByDescending(lot => lot.DateEntree).ThenByDescending(lot => lot.Id).ToListAsync()
            : await query.OrderBy(lot => lot.DateEntree).ThenBy(lot => lot.Id).ToListAsync();

        if (lots.Sum(lot => lot.QuantiteRestante) < quantity)
            throw new InvalidOperationException("Le stock disponible est insuffisant pour effectuer cet ajustement.");

        var remainingQuantity = quantity;
        foreach (var lot in lots)
        {
            var removedQuantity = Math.Min(lot.QuantiteRestante, remainingQuantity);
            lot.QuantiteRestante -= removedQuantity;
            remainingQuantity -= removedQuantity;
            if (remainingQuantity == 0)
                break;
        }
    }
}
