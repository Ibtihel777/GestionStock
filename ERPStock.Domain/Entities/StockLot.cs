namespace ERPStock.Domain.Entities;

public class StockLot
{
    public int Id { get; set; }
    public int QuantiteRestante { get; set; }
    public decimal PrixUnitaire { get; set; }
    public DateTime DateEntree { get; set; }

    public int ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public int EmplacementId { get; set; }
    public Emplacement Emplacement { get; set; } = null!;
}
