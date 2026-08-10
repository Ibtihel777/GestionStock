using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class MouvementStockRepository : IMouvementStockRepository
{
    private readonly AppDbContext _context;

    public MouvementStockRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MouvementStock>> GetAllAsync()
    {
        return await WithRelations()
            .OrderByDescending(mouvement => mouvement.DateMouvement)
            .ThenByDescending(mouvement => mouvement.Id)
            .ToListAsync();
    }

    public Task<MouvementStock?> GetByIdAsync(int id)
    {
        return WithRelations().FirstOrDefaultAsync(mouvement => mouvement.Id == id);
    }

    public async Task<MouvementStock> RecordAsync(MouvementStock mouvement)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        if (mouvement.Type is TypeMouvementStock.Sortie or TypeMouvementStock.Transfert)
            await DecreaseStockAsync(mouvement.ArticleId, mouvement.EmplacementSourceId!.Value, mouvement.Quantite);

        if (mouvement.Type is TypeMouvementStock.Entree or TypeMouvementStock.Transfert)
            await IncreaseStockAsync(mouvement.ArticleId, mouvement.EmplacementDestinationId!.Value, mouvement.Quantite);

        _context.MouvementsStock.Add(mouvement);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return (await GetByIdAsync(mouvement.Id))!;
    }

    private async Task DecreaseStockAsync(int articleId, int emplacementId, int quantity)
    {
        var stocks = await _context.Stocks
            .Where(stock => stock.ArticleId == articleId && stock.EmplacementId == emplacementId)
            .OrderBy(stock => stock.Id)
            .ToListAsync();

        if (stocks.Sum(stock => stock.Quantite) < quantity)
            throw new InvalidOperationException("Le stock disponible est insuffisant pour effectuer cette opération.");

        var remainingQuantity = quantity;
        foreach (var stock in stocks)
        {
            var deductedQuantity = Math.Min(stock.Quantite, remainingQuantity);
            stock.Quantite -= deductedQuantity;
            remainingQuantity -= deductedQuantity;

            if (remainingQuantity == 0)
                break;
        }
    }

    private async Task IncreaseStockAsync(int articleId, int emplacementId, int quantity)
    {
        var stock = await _context.Stocks
            .Where(item => item.ArticleId == articleId && item.EmplacementId == emplacementId)
            .OrderBy(item => item.Id)
            .FirstOrDefaultAsync();

        if (stock is null)
        {
            _context.Stocks.Add(new Stock
            {
                ArticleId = articleId,
                EmplacementId = emplacementId,
                Quantite = quantity
            });
            return;
        }

        stock.Quantite += quantity;
    }

    private IQueryable<MouvementStock> WithRelations() => _context.MouvementsStock
        .Include(mouvement => mouvement.Article)
        .Include(mouvement => mouvement.EmplacementSource)
        .Include(mouvement => mouvement.EmplacementDestination);
}
