using ERPStock.Domain.Entities;

namespace ERPStock.Application.DTOs;

public class ArticleDto
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string ModeGestion { get; set; } = string.Empty;
    public int FamilleArticleId { get; set; }
    public string FamilleReference { get; set; } = string.Empty;
    public string FamilleNom { get; set; } = string.Empty;
    public TypeArticle Type { get; set; }
    public ModeSuiviStock SuiviStock { get; set; }
    public decimal CMUP { get; set; }
    public string UniteMesure { get; set; } = string.Empty;
    public int SeuilMinimum { get; set; }
    public int QuantiteEnStock { get; set; }
    public DateTime DateCreation { get; set; }
}
