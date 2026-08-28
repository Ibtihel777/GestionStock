namespace ERPStock.Domain.Entities;

public class Depot
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;

    public int? DepotParentId { get; set; }
    public Depot? DepotParent { get; set; }
    public ICollection<Depot> DepotsEnfants { get; set; } = new List<Depot>();
    public ICollection<Emplacement> Emplacements { get; set; } = new List<Emplacement>();
}
