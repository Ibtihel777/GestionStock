using ERPStock.Application.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERPStock.Infrastructure.Data;

public static class IdentityDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in new[] { AppRoles.SuperAdmin, AppRoles.Consultant })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        await CreateUserIfMissingAsync(
            userManager,
            configuration["InitialUsers:SuperAdmin:Email"],
            configuration["InitialUsers:SuperAdmin:Password"],
            AppRoles.SuperAdmin);
        await CreateUserIfMissingAsync(
            userManager,
            configuration["InitialUsers:Consultant:Email"],
            configuration["InitialUsers:Consultant:Password"],
            AppRoles.Consultant);
    }

    private static async Task CreateUserIfMissingAsync(
        UserManager<ApplicationUser> userManager,
        string? email,
        string? password,
        string role)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)
            || await userManager.FindByEmailAsync(email) is not null)
            return;

        var user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException($"Impossible de créer le compte initial {email}: {string.Join(" ", result.Errors.Select(error => error.Description))}");

        await userManager.AddToRoleAsync(user, role);
    }
}
