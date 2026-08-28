namespace ERPStock.Application.DTOs;

public class CreateDepotDto
{
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public int? DepotParentId { get; set; }
}
