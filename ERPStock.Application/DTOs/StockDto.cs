namespace ERPStock.Application.DTOs;

public class StockDto
{
    public int Id { get; set; }
    public int Quantite { get; set; }
    public int ArticleId { get; set; }
    public string ArticleReference { get; set; } = string.Empty;
    public string ArticleUniteMesure { get; set; } = string.Empty;
    public int ArticleSeuilMinimum { get; set; }
    public int QuantiteTotaleArticle { get; set; }
    public int EmplacementId { get; set; }
    public string CodeEmplacement { get; set; } = string.Empty;
}
