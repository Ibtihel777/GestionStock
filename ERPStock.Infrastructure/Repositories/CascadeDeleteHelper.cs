using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

internal static class CascadeDeleteHelper
{
    public static async Task DeleteArticlesAsync(AppDbContext context, IReadOnlyCollection<int> articleIds)
    {
        if (articleIds.Count == 0) return;

        await context.Signalements.Where(item => articleIds.Contains(item.ArticleId)).ExecuteDeleteAsync();
        await context.VerificationsStock.Where(item => articleIds.Contains(item.ArticleId)).ExecuteDeleteAsync();
        await context.MouvementsStock.Where(item => articleIds.Contains(item.ArticleId)).ExecuteDeleteAsync();
        await context.StockLots.Where(item => articleIds.Contains(item.ArticleId)).ExecuteDeleteAsync();
        await context.Stocks.Where(item => articleIds.Contains(item.ArticleId)).ExecuteDeleteAsync();
        await context.Articles.Where(item => articleIds.Contains(item.Id)).ExecuteDeleteAsync();
    }

    public static async Task DeleteEmplacementsAsync(AppDbContext context, IReadOnlyCollection<int> emplacementIds)
    {
        if (emplacementIds.Count == 0) return;

        await context.Signalements.Where(item => emplacementIds.Contains(item.EmplacementId)).ExecuteDeleteAsync();
        await context.VerificationsStock.Where(item => emplacementIds.Contains(item.EmplacementId)).ExecuteDeleteAsync();
        await context.MouvementsStock.Where(item =>
            (item.EmplacementSourceId.HasValue && emplacementIds.Contains(item.EmplacementSourceId.Value))
            || (item.EmplacementDestinationId.HasValue && emplacementIds.Contains(item.EmplacementDestinationId.Value)))
            .ExecuteDeleteAsync();
        await context.StockLots.Where(item => emplacementIds.Contains(item.EmplacementId)).ExecuteDeleteAsync();
        await context.Stocks.Where(item => emplacementIds.Contains(item.EmplacementId)).ExecuteDeleteAsync();
        await context.Emplacements.Where(item => emplacementIds.Contains(item.Id)).ExecuteDeleteAsync();
    }

    public static async Task<List<int>> GetDepotTreeIdsAsync(AppDbContext context, int rootId)
    {
        var depots = await context.Depots.AsNoTracking()
            .Select(item => new { item.Id, item.DepotParentId })
            .ToListAsync();
        return GetTreeIds(depots.Select(item => (item.Id, item.DepotParentId)), rootId);
    }

    public static async Task<List<int>> GetFamilleTreeIdsAsync(AppDbContext context, int rootId)
    {
        var familles = await context.FamillesArticles.AsNoTracking()
            .Select(item => new { item.Id, item.FamilleParentId })
            .ToListAsync();
        return GetTreeIds(familles.Select(item => (item.Id, item.FamilleParentId)), rootId);
    }

    public static async Task DeleteFamiliesAsync(AppDbContext context, IReadOnlyCollection<int> familleIds)
    {
        var articleIds = await context.Articles
            .Where(item => familleIds.Contains(item.FamilleArticleId))
            .Select(item => item.Id)
            .ToListAsync();
        await DeleteArticlesAsync(context, articleIds);

        foreach (var familleId in familleIds.Reverse())
            await context.FamillesArticles.Where(item => item.Id == familleId).ExecuteDeleteAsync();
    }

    public static async Task DeleteDepotsAsync(AppDbContext context, IReadOnlyCollection<int> depotIds)
    {
        var emplacementIds = await context.Emplacements
            .Where(item => depotIds.Contains(item.DepotId))
            .Select(item => item.Id)
            .ToListAsync();
        await DeleteEmplacementsAsync(context, emplacementIds);

        foreach (var depotId in depotIds.Reverse())
            await context.Depots.Where(item => item.Id == depotId).ExecuteDeleteAsync();
    }

    private static List<int> GetTreeIds(IEnumerable<(int Id, int? ParentId)> entities, int rootId)
    {
        var items = entities.ToList();
        if (!items.Any(item => item.Id == rootId)) return [];

        var childrenByParent = items
            .Where(item => item.ParentId.HasValue)
            .GroupBy(item => item.ParentId!.Value)
            .ToDictionary(group => group.Key, group => group.Select(item => item.Id).ToList());
        var ids = new List<int>();
        var queue = new Queue<int>([rootId]);

        while (queue.TryDequeue(out var currentId))
        {
            ids.Add(currentId);
            if (!childrenByParent.TryGetValue(currentId, out var childIds)) continue;
            foreach (var childId in childIds) queue.Enqueue(childId);
        }

        return ids;
    }
}
