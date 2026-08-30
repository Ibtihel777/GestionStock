using Microsoft.AspNetCore.Identity;

namespace ERPStock.Infrastructure.Data;

public class ApplicationUser : IdentityUser
{
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string StatutApprobation { get; set; } = AccountApprovalStatus.Acceptee;
    public DateTime DateDemande { get; set; } = DateTime.UtcNow;
}

public static class AccountApprovalStatus
{
    public const string EnAttente = "EnAttente";
    public const string Acceptee = "Acceptee";
    public const string Refusee = "Refusee";
}
