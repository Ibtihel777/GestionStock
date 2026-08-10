namespace ERPStock.Application.DTOs;

public class EmplacementDto
{
    public int Id { get; set; }
    public string Zone { get; set; } = string.Empty;
    public string Etagere { get; set; } = string.Empty;
    public string Tiroir { get; set; } = string.Empty;
    public string CodeEmplacement { get; set; } = string.Empty;
}
