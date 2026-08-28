using ERPStock.Domain.Entities;

namespace ERPStock.Application.DTOs;

public class CreateArticleDto
{
    public string Reference { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string ModeGestion { get; set; } = string.Empty;
    public int FamilleArticleId { get; set; }
    public TypeArticle Type { get; set; }
    public ModeSuiviStock SuiviStock { get; set; }
    public decimal CMUP { get; set; }
    public int? UnitesParCarton { get; set; }
    public int InitialStockQuantity { get; set; }
    public int? InitialStockEmplacementId { get; set; }
}
