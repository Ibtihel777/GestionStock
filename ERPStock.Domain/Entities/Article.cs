
namespace ERPStock.Domain.Entities;

public class Article
{
    public int Id { get; set; }
    public string Reference { get; set; }
    public string Designation { get; set; }
    public string ModeGestion { get; set; }
    public decimal CMUP { get; set; }
    public DateTime DateCreation { get; set; }  

    public ICollection<Stock> Stocks { get; set; }
    public ICollection<MouvementStock> MouvementsStock { get; set; }
}
