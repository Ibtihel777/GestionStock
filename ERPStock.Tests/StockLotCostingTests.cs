using ERPStock.Application.Services;
using ERPStock.Domain.Entities;

namespace ERPStock.Tests;

public class StockLotCostingTests
{
    private static readonly DateTime OlderLotDate = new(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime NewerLotDate = new(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void OrderForConsumption_Fifo_SelectsOldestLotFirst()
    {
        var lots = CreateLots();

        var orderedLots = StockLotCosting.OrderForConsumption(lots, "FIFO");

        Assert.Equal(OlderLotDate, orderedLots[0].DateEntree);
        Assert.Equal(10m, orderedLots[0].PrixUnitaire);
    }

    [Fact]
    public void OrderForConsumption_Lifo_SelectsNewestLotFirst()
    {
        var lots = CreateLots();

        var orderedLots = StockLotCosting.OrderForConsumption(lots, "LIFO");

        Assert.Equal(NewerLotDate, orderedLots[0].DateEntree);
        Assert.Equal(20m, orderedLots[0].PrixUnitaire);
    }

    [Fact]
    public void ResolveUnitPrice_Cmup_UsesWeightedAverageInsteadOfLotPrice()
    {
        var lot = new StockLot { PrixUnitaire = 20m };

        var unitPrice = StockLotCosting.ResolveUnitPrice("CMUP", 14m, lot);

        Assert.Equal(14m, unitPrice);
    }

    private static List<StockLot> CreateLots() =>
    [
        new StockLot { Id = 1, QuantiteRestante = 10, PrixUnitaire = 10m, DateEntree = OlderLotDate },
        new StockLot { Id = 2, QuantiteRestante = 10, PrixUnitaire = 20m, DateEntree = NewerLotDate }
    ];
}
