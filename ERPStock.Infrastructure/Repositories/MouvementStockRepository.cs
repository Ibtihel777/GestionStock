using ERPStock.Application.Interfaces;
using ERPStock.Application.Services;
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

    public async Task<MouvementStock> RecordAsync(MouvementStock mouvement, string modeGestion, decimal cmup)
    {
        if (modeGestion is not ("FIFO" or "LIFO" or "CMUP"))
            throw new ArgumentException("Le mode de gestion de l'article doit etre FIFO, LIFO ou CMUP.");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        var lotsConsommes = new List<LotConsomme>();

        if (mouvement.Type is TypeMouvementStock.Sortie or TypeMouvementStock.Transfert)
        {
            lotsConsommes = await ConsumeLotsAsync(
                mouvement.ArticleId,
                mouvement.EmplacementSourceId!.Value,
                mouvement.Quantite,
                modeGestion,
                cmup);
            await DecreaseStockAsync(mouvement.ArticleId, mouvement.EmplacementSourceId!.Value, mouvement.Quantite);
            mouvement.PrixUnitaireSortie = CalculateUnitCost(lotsConsommes, mouvement.Quantite);
        }

        if (mouvement.Type is TypeMouvementStock.Entree or TypeMouvementStock.Transfert)
        {
            await IncreaseStockAsync(mouvement.ArticleId, mouvement.EmplacementDestinationId!.Value, mouvement.Quantite);

            if (mouvement.Type == TypeMouvementStock.Entree)
            {
                _context.StockLots.Add(new StockLot
                {
                    ArticleId = mouvement.ArticleId,
                    EmplacementId = mouvement.EmplacementDestinationId.Value,
                    QuantiteRestante = mouvement.Quantite,
                    PrixUnitaire = mouvement.PrixUnitaireEntree!.Value,
                    DateEntree = mouvement.DateMouvement
                });
            }
            else
            {
                foreach (var lot in lotsConsommes)
                {
                    _context.StockLots.Add(new StockLot
                    {
                        ArticleId = mouvement.ArticleId,
                        EmplacementId = mouvement.EmplacementDestinationId.Value,
                        QuantiteRestante = lot.Quantite,
                        PrixUnitaire = lot.PrixUnitaire,
                        DateEntree = lot.DateEntree
                    });
                }
            }
        }

        _context.MouvementsStock.Add(mouvement);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return (await GetByIdAsync(mouvement.Id))!;
    }

    private async Task<List<LotConsomme>> ConsumeLotsAsync(
        int articleId,
        int emplacementId,
        int quantity,
        string modeGestion,
        decimal cmup)
    {
        var lots = await _context.StockLots
            .Where(lot => lot.ArticleId == articleId && lot.EmplacementId == emplacementId && lot.QuantiteRestante > 0)
            .ToListAsync();
        var orderedLots = StockLotCosting.OrderForConsumption(lots, modeGestion);

        if (orderedLots.Sum(lot => lot.QuantiteRestante) < quantity)
            throw new InvalidOperationException("Le stock disponible est insuffisant pour effectuer cette operation.");

        var remainingQuantity = quantity;
        var consumedLots = new List<LotConsomme>();
        foreach (var lot in orderedLots)
        {
            var consumedQuantity = Math.Min(lot.QuantiteRestante, remainingQuantity);
            lot.QuantiteRestante -= consumedQuantity;
            remainingQuantity -= consumedQuantity;
            consumedLots.Add(new LotConsomme(
                consumedQuantity,
                StockLotCosting.ResolveUnitPrice(modeGestion, cmup, lot),
                lot.DateEntree));

            if (remainingQuantity == 0)
                break;
        }

        return consumedLots;
    }

    private static decimal CalculateUnitCost(IEnumerable<LotConsomme> lots, int totalQuantity)
    {
        var totalCost = lots.Sum(lot => lot.Quantite * lot.PrixUnitaire);
        return totalCost / totalQuantity;
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

    private sealed record LotConsomme(int Quantite, decimal PrixUnitaire, DateTime DateEntree);
}
