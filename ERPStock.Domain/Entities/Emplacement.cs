

namespace ERPStock.Domain.Entities;

public class Emplacement
{
    public int Id { get; set; }
    public string Zone { get; set; } = string.Empty;
    public string Etagere { get; set; } = string.Empty;
    public string Tiroir { get; set; } = string.Empty;
    public string Code_Emplacement { get; set; } = string.Empty;

    public int DepotId { get; set; }
    public Depot Depot { get; set; } = null!;

    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    public ICollection<MouvementStock> MouvementsSource { get; set; } = new List<MouvementStock>();
    public ICollection<MouvementStock> MouvementsDestination { get; set; } = new List<MouvementStock>();
    public ICollection<VerificationStock> VerificationsStock { get; set; } = new List<VerificationStock>();
    public ICollection<Signalement> Signalements { get; set; } = new List<Signalement>();
}
