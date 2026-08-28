namespace ERPStock.Application.DTOs;

public class DepotDto
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public int? DepotParentId { get; set; }
    public string? ReferenceDepotParent { get; set; }
}
