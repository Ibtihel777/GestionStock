namespace ERPStock.Application.DTOs;

public class CreateArticleDto
{
    public string Reference { get; set; }
    public string Designation { get; set; }
    public string ModeGestion { get; set; }
    public decimal CMUP { get; set; }
    public int? UnitesParCarton { get; set; }
}
