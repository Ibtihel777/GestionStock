using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class StockService
{
    private readonly IStockRepository _repository;

    public StockService(IStockRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<StockDto>> GetAllAsync()
    {
        var stocks = await _repository.GetAllAsync();
        return stocks.Select(ToDto).ToList();
    }

    public async Task<StockDto?> GetByIdAsync(int id)
    {
        var stock = await _repository.GetByIdAsync(id);
        return stock is null ? null : ToDto(stock);
    }

    public async Task<StockDto> CreateAsync(CreateStockDto dto)
    {
        var stock = new Stock
        {
            Quantite = dto.Quantite,
            ArticleId = dto.ArticleId,
            EmplacementId = dto.EmplacementId
        };

        await _repository.AddAsync(stock);
        var createdStock = await _repository.GetByIdAsync(stock.Id);
        return ToDto(createdStock!);
    }

    public async Task<bool> UpdateAsync(int id, CreateStockDto dto)
    {
        var stock = await _repository.GetByIdAsync(id);
        if (stock is null) return false;

        stock.Quantite = dto.Quantite;
        stock.ArticleId = dto.ArticleId;
        stock.EmplacementId = dto.EmplacementId;

        await _repository.UpdateAsync(stock);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var stock = await _repository.GetByIdAsync(id);
        if (stock is null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static StockDto ToDto(Stock stock)
    {
        return new StockDto
        {
            Id = stock.Id,
            Quantite = stock.Quantite,
            ArticleId = stock.ArticleId,
            ArticleReference = stock.Article.Reference,
            EmplacementId = stock.EmplacementId,
            CodeEmplacement = stock.Emplacement.Code_Emplacement
        };
    }
}
