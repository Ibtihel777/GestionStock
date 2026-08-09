

namespace ERPStock.Domain.Entities;

public class Emplacement
{
    public int Id { get; set; }
    public string Zone { get; set; }
    public string Etagere { get; set; }
    public string Tiroir { get; set; }
    public string Code_Emplacement { get; set; }

    public ICollection<Stock> Stocks { get; set; }
}