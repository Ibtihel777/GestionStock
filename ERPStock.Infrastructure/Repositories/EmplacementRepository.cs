using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class EmplacementRepository : IEmplacementRepository
{
    private readonly AppDbContext _context;

    public EmplacementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Emplacement>> GetAllAsync()
    {
        return await _context.Emplacements.ToListAsync();
    }

    public async Task<Emplacement?> GetByIdAsync(int id)
    {
        return await _context.Emplacements.FindAsync(id);
    }

    public async Task AddAsync(Emplacement emplacement)
    {
        _context.Emplacements.Add(emplacement);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Emplacement emplacement)
    {
        _context.Emplacements.Update(emplacement);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var emplacement = await _context.Emplacements.FindAsync(id);
        if (emplacement is not null)
        {
            _context.Emplacements.Remove(emplacement);
            await _context.SaveChangesAsync();
        }
    }
}
