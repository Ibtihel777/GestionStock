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
    public DbSet<MouvementStock> MouvementsStock { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MouvementStock>(entity =>
        {
            entity.HasOne(mouvement => mouvement.Article)
                .WithMany(article => article.MouvementsStock)
                .HasForeignKey(mouvement => mouvement.ArticleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(mouvement => mouvement.EmplacementSource)
                .WithMany(emplacement => emplacement.MouvementsSource)
                .HasForeignKey(mouvement => mouvement.EmplacementSourceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(mouvement => mouvement.EmplacementDestination)
                .WithMany(emplacement => emplacement.MouvementsDestination)
                .HasForeignKey(mouvement => mouvement.EmplacementDestinationId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
