using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class FamilleArticleRepository : IFamilleArticleRepository
{
    private readonly AppDbContext _context;

    public FamilleArticleRepository(AppDbContext context) => _context = context;

    public Task<List<FamilleArticle>> GetAllAsync() => _context.FamillesArticles
        .Include(famille => famille.FamilleParent)
        .ToListAsync();

    public Task<FamilleArticle?> GetByIdAsync(int id) => _context.FamillesArticles
        .Include(famille => famille.FamilleParent)
        .FirstOrDefaultAsync(famille => famille.Id == id);

    public async Task AddAsync(FamilleArticle famille)
    {
        _context.FamillesArticles.Add(famille);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(FamilleArticle famille)
    {
        _context.FamillesArticles.Update(famille);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var familleIds = await CascadeDeleteHelper.GetFamilleTreeIdsAsync(_context, id);
        if (familleIds.Count == 0) return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        await CascadeDeleteHelper.DeleteFamiliesAsync(_context, familleIds);
        await transaction.CommitAsync();
    }
}
