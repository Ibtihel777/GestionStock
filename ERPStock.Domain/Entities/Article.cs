
namespace ERPStock.Domain.Entities;

public class Article
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string ModeGestion { get; set; } = string.Empty;
    public int FamilleArticleId { get; set; }
    public FamilleArticle FamilleArticle { get; set; } = null!;
    public TypeArticle Type { get; set; }
    public ModeSuiviStock SuiviStock { get; set; }
    public decimal CMUP { get; set; }
    public string UniteMesure { get; set; } = "Unit\u00e9";
    public int SeuilMinimum { get; set; } = 10;
    public DateTime DateCreation { get; set; }  

    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    public ICollection<StockLot> LotsStock { get; set; } = new List<StockLot>();
    public ICollection<MouvementStock> MouvementsStock { get; set; } = new List<MouvementStock>();
    public ICollection<VerificationStock> VerificationsStock { get; set; } = new List<VerificationStock>();
    public ICollection<Signalement> Signalements { get; set; } = new List<Signalement>();
}
