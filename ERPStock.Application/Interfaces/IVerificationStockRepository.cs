using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IVerificationStockRepository
{
    Task<List<VerificationStock>> GetAllAsync();
    Task AddAsync(VerificationStock verification);
}
