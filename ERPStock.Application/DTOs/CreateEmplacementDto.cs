namespace ERPStock.Application.DTOs;

public class CreateEmplacementDto
{
    public int DepotId { get; set; }
    public string Zone { get; set; } = string.Empty;
    public string Etagere { get; set; } = string.Empty;
    public string Tiroir { get; set; } = string.Empty;
}
