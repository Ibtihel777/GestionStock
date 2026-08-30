using System.ComponentModel.DataAnnotations;

namespace ERPStock.Application.DTOs;

public class CreateUserDto
{
    [Required, StringLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required, StringLength(25), RegularExpression(@"^[0-9+(). -]{6,25}$", ErrorMessage = "Le numéro de téléphone est invalide.")]
    public string Telephone { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
