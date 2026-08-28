using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public static class StockLotCosting
{
    public static List<StockLot> OrderForConsumption(IEnumerable<StockLot> lots, string modeGestion) => modeGestion == "LIFO"
        ? lots.OrderByDescending(lot => lot.DateEntree).ThenByDescending(lot => lot.Id).ToList()
        : lots.OrderBy(lot => lot.DateEntree).ThenBy(lot => lot.Id).ToList();

    public static decimal ResolveUnitPrice(string modeGestion, decimal cmup, StockLot lot) =>
        modeGestion == "CMUP" ? cmup : lot.PrixUnitaire;
}
