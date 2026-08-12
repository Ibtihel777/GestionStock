namespace ERPStock.Domain.Entities;

public class Signalement
{
    public int Id { get; set; }
    public DateTime DateSignalement { get; set; } = DateTime.UtcNow;
    public int QuantiteTheorique { get; set; }
    public int QuantiteDetectee { get; set; }
    public int Ecart { get; set; }
    public StatutSignalement Statut { get; set; } = StatutSignalement.EnAttente;
    public string SignaleParUserId { get; set; } = string.Empty;
    public string SignalePar { get; set; } = string.Empty;

    public int ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public int EmplacementId { get; set; }
    public Emplacement Emplacement { get; set; } = null!;
}
