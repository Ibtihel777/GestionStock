namespace ERPStock.Application.DTOs;

public class VerificationStockDto
{
    public int Id { get; set; }
    public DateTime DateVerification { get; set; }
    public int QuantiteTheorique { get; set; }
    public int QuantiteDetectee { get; set; }
    public int Ecart { get; set; }
    public string? PhotoUrl { get; set; }
    public int ArticleId { get; set; }
    public string ArticleReference { get; set; } = string.Empty;
    public string ArticleDesignation { get; set; } = string.Empty;
    public int EmplacementId { get; set; }
    public string CodeEmplacement { get; set; } = string.Empty;
}
