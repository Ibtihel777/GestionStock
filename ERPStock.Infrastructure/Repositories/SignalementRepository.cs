using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class SignalementRepository : ISignalementRepository
{
    private readonly AppDbContext _context;

    public SignalementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Signalement signalement)
    {
        _context.Signalements.Add(signalement);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Signalement>> GetAllAsync()
    {
        return await _context.Signalements
            .Include(signalement => signalement.Article)
            .Include(signalement => signalement.Emplacement)
            .OrderBy(signalement => signalement.Statut)
            .ThenByDescending(signalement => signalement.DateSignalement)
            .ToListAsync();
    }

    public Task<Signalement?> GetByIdAsync(int id)
    {
        return _context.Signalements
            .Include(signalement => signalement.Article)
            .Include(signalement => signalement.Emplacement)
            .FirstOrDefaultAsync(signalement => signalement.Id == id);
    }

    public async Task UpdateAsync(Signalement signalement)
    {
        _context.Signalements.Update(signalement);
        await _context.SaveChangesAsync();
    }
}
