using ERPStock.Domain.Entities;

namespace ERPStock.Application.DTOs;

public class MouvementStockDto
{
    public int Id { get; set; }
    public TypeMouvementStock Type { get; set; }
    public DateTime DateMouvement { get; set; }
    public int Quantite { get; set; }
    public int ArticleId { get; set; }
    public string ArticleReference { get; set; } = string.Empty;
    public int? EmplacementSourceId { get; set; }
    public string? CodeEmplacementSource { get; set; }
    public int? EmplacementDestinationId { get; set; }
    public string? CodeEmplacementDestination { get; set; }
}
