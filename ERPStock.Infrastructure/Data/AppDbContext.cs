using Microsoft.EntityFrameworkCore;
using ERPStock.Domain.Entities;

namespace ERPStock.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Article> Articles { get; set; }
    public DbSet<Emplacement> Emplacements { get; set; }
    public DbSet<Stock> Stocks { get; set; }
}