using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class DepotRepository : IDepotRepository
{
    private readonly AppDbContext _context;

    public DepotRepository(AppDbContext context) => _context = context;

    public Task<List<Depot>> GetAllAsync() => _context.Depots
        .Include(depot => depot.DepotParent)
        .ToListAsync();

    public Task<Depot?> GetByIdAsync(int id) => _context.Depots
        .Include(depot => depot.DepotParent)
        .FirstOrDefaultAsync(depot => depot.Id == id);

    public async Task AddAsync(Depot depot)
    {
        _context.Depots.Add(depot);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Depot depot)
    {
        _context.Depots.Update(depot);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var depotIds = await CascadeDeleteHelper.GetDepotTreeIdsAsync(_context, id);
        if (depotIds.Count == 0) return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        await CascadeDeleteHelper.DeleteDepotsAsync(_context, depotIds);
        await transaction.CommitAsync();
    }
}
