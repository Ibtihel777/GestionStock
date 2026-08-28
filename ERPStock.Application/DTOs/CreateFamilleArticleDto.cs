namespace ERPStock.Application.DTOs;

public class CreateFamilleArticleDto
{
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public int? FamilleParentId { get; set; }
}
