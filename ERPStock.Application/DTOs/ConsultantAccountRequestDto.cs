namespace ERPStock.Application.DTOs;

public class ConsultantAccountRequestDto
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telephone { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public DateTime DateDemande { get; set; }
}
