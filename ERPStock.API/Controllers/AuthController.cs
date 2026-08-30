using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ERPStock.Application.DTOs;
using ERPStock.Application.Security;
using ERPStock.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        if (user.StatutApprobation == AccountApprovalStatus.EnAttente)
            return Unauthorized(new { message = "Votre demande de création de compte est en attente d'acceptation par un administrateur." });

        if (user.StatutApprobation == AccountApprovalStatus.Refusee)
            return Unauthorized(new { message = "Votre demande de création de compte a été refusée." });

        var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault();
        if (role is null)
            return Unauthorized(new { message = "Ce compte n'a aucun rôle attribué." });

        return Ok(new AuthResponseDto
        {
            Token = CreateToken(user, role),
            Email = user.Email ?? user.UserName ?? string.Empty,
            Role = role
        });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
    {
        var email = dto.Email.Trim();
        if (await _userManager.FindByEmailAsync(email) is not null)
            return Conflict(new { message = "Un compte utilise déjà cet email." });

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            Nom = dto.Nom.Trim(),
            Prenom = dto.Prenom.Trim(),
            PhoneNumber = dto.Telephone.Trim(),
            StatutApprobation = AccountApprovalStatus.EnAttente,
            DateDemande = DateTime.UtcNow
        };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(error => error.Description)) });

        var roleResult = await _userManager.AddToRoleAsync(user, AppRoles.Consultant);
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return BadRequest(new { message = string.Join(" ", roleResult.Errors.Select(error => error.Description)) });
        }

        return Created(string.Empty, new { message = "Votre demande a été envoyée. Vous recevrez l'accès après validation par un administrateur." });
    }

    [HttpGet("consultant-requests")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<ActionResult<IEnumerable<ConsultantAccountRequestDto>>> GetConsultantRequests()
    {
        var consultants = await _userManager.GetUsersInRoleAsync(AppRoles.Consultant);
        return Ok(consultants
            .Where(user => user.StatutApprobation == AccountApprovalStatus.EnAttente)
            .OrderByDescending(user => user.DateDemande)
            .Select(user => new ConsultantAccountRequestDto
            {
                Id = user.Id,
                Nom = user.Nom,
                Prenom = user.Prenom,
                Email = user.Email ?? string.Empty,
                Telephone = user.PhoneNumber ?? string.Empty,
                Statut = user.StatutApprobation,
                DateDemande = user.DateDemande
            }));
    }

    [HttpPatch("consultant-requests/{id}/accepter")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public Task<IActionResult> ApproveConsultantRequest(string id) => UpdateConsultantRequestStatus(id, AccountApprovalStatus.Acceptee);

    [HttpPatch("consultant-requests/{id}/refuser")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public Task<IActionResult> RejectConsultantRequest(string id) => UpdateConsultantRequestStatus(id, AccountApprovalStatus.Refusee);

    private async Task<IActionResult> UpdateConsultantRequestStatus(string id, string statut)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null || !await _userManager.IsInRoleAsync(user, AppRoles.Consultant))
            return NotFound(new { message = "Demande de compte introuvable." });

        if (user.StatutApprobation != AccountApprovalStatus.EnAttente)
            return Conflict(new { message = "Cette demande a déjà été traitée." });

        user.StatutApprobation = statut;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(error => error.Description)) });

        return NoContent();
    }

    private string CreateToken(ApplicationUser user, string role)
    {
        var jwt = _configuration.GetSection("Jwt");
        var key = jwt["Key"] ?? throw new InvalidOperationException("La clé JWT est absente.");
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, role)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(double.TryParse(jwt["ExpiresHours"], out var hours) ? hours : 8);

        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials));
    }
}
