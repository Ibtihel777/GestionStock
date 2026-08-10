namespace ERPStock.Application.DTOs;

public class CreateStockDto
{
    public int Quantite { get; set; }
    public int ArticleId { get; set; }
    public int EmplacementId { get; set; }
}
