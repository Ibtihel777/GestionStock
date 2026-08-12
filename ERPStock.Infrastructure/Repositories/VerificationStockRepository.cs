using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERPStock.Infrastructure.Repositories;

public class VerificationStockRepository : IVerificationStockRepository
{
    private readonly AppDbContext _context;

    public VerificationStockRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<VerificationStock>> GetAllAsync()
    {
        return await _context.VerificationsStock
            .Include(verification => verification.Article)
            .Include(verification => verification.Emplacement)
            .OrderByDescending(verification => verification.DateVerification)
            .ThenByDescending(verification => verification.Id)
            .ToListAsync();
    }

    public async Task AddAsync(VerificationStock verification)
    {
        _context.VerificationsStock.Add(verification);
        await _context.SaveChangesAsync();
    }
}
