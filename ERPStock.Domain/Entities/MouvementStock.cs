namespace ERPStock.Domain.Entities;

public class MouvementStock
{
    public int Id { get; set; }
    public TypeMouvementStock Type { get; set; }
    public DateTime DateMouvement { get; set; } = DateTime.UtcNow;
    public int Quantite { get; set; }
    public decimal? PrixUnitaireEntree { get; set; }

    public int ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public int? EmplacementSourceId { get; set; }
    public Emplacement? EmplacementSource { get; set; }

    public int? EmplacementDestinationId { get; set; }
    public Emplacement? EmplacementDestination { get; set; }
}
