using ERPStock.Domain.Entities;

namespace ERPStock.Application.Interfaces;

public interface IMouvementStockRepository
{
    Task<List<MouvementStock>> GetAllAsync();
    Task<MouvementStock?> GetByIdAsync(int id);
    Task<MouvementStock> RecordAsync(MouvementStock mouvement);
}
