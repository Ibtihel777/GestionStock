namespace ERPStock.Domain.Entities;

public class FamilleArticle
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;

    public int? FamilleParentId { get; set; }
    public FamilleArticle? FamilleParent { get; set; }
    public ICollection<FamilleArticle> FamillesEnfants { get; set; } = new List<FamilleArticle>();
    public ICollection<Article> Articles { get; set; } = new List<Article>();
}
