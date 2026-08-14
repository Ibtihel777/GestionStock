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
        if (await _userManager.FindByEmailAsync(dto.Email) is not null)
            return Conflict(new { message = "Un compte utilise déjà cet email." });

        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, EmailConfirmed = true };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(error => error.Description)) });

        await _userManager.AddToRoleAsync(user, AppRoles.Consultant);
        return Created(string.Empty, new { email = user.Email, role = AppRoles.Consultant });
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
