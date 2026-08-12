namespace ERPStock.Application.DTOs;

public class CreateVerificationStockDto
{
    public int ArticleId { get; set; }
    public int EmplacementId { get; set; }
    public byte[] Photo { get; set; } = Array.Empty<byte>();
    public string PhotoContentType { get; set; } = string.Empty;
}
