namespace ERPStock.Application.DTOs;

public class FamilleArticleDto
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public int? FamilleParentId { get; set; }
    public string? ReferenceFamilleParent { get; set; }
}
