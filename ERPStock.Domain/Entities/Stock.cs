namespace ERPStock.Domain.Entities;

public class Stock
{
    public int Id { get; set; }
    public int Quantite { get; set; }

    public int ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public int EmplacementId { get; set; }
    public Emplacement Emplacement { get; set; } = null!;
}
