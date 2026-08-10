using ERPStock.Domain.Entities;

namespace ERPStock.Application.DTOs;

public class CreateMouvementStockDto
{
    public TypeMouvementStock Type { get; set; }
    public int Quantite { get; set; }
    public int ArticleId { get; set; }
    public int? EmplacementSourceId { get; set; }
    public int? EmplacementDestinationId { get; set; }
}
