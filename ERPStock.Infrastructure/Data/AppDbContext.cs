using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ERPStock.Domain.Entities;

namespace ERPStock.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Article> Articles { get; set; }
    public DbSet<Depot> Depots { get; set; }
    public DbSet<FamilleArticle> FamillesArticles { get; set; }
    public DbSet<Emplacement> Emplacements { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<StockLot> StockLots { get; set; }
    public DbSet<MouvementStock> MouvementsStock { get; set; }
    public DbSet<VerificationStock> VerificationsStock { get; set; }
    public DbSet<Signalement> Signalements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.Nom).HasMaxLength(100);
            entity.Property(user => user.Prenom).HasMaxLength(100);
            entity.Property(user => user.StatutApprobation).HasMaxLength(20).HasDefaultValue(AccountApprovalStatus.Acceptee);
            entity.Property(user => user.DateDemande).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Depot>(entity =>
        {
            entity.HasOne(depot => depot.DepotParent)
                .WithMany(depot => depot.DepotsEnfants)
                .HasForeignKey(depot => depot.DepotParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FamilleArticle>(entity =>
        {
            entity.HasOne(famille => famille.FamilleParent)
                .WithMany(famille => famille.FamillesEnfants)
                .HasForeignKey(famille => famille.FamilleParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasOne(article => article.FamilleArticle)
                .WithMany(famille => famille.Articles)
                .HasForeignKey(article => article.FamilleArticleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Emplacement>(entity =>
        {
            entity.HasOne(emplacement => emplacement.Depot)
                .WithMany(depot => depot.Emplacements)
                .HasForeignKey(emplacement => emplacement.DepotId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StockLot>(entity =>
        {
            entity.HasOne(lot => lot.Article)
                .WithMany(article => article.LotsStock)
                .HasForeignKey(lot => lot.ArticleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(lot => lot.Emplacement)
                .WithMany(emplacement => emplacement.LotsStock)
                .HasForeignKey(lot => lot.EmplacementId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(lot => new { lot.ArticleId, lot.EmplacementId, lot.DateEntree });
        });

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

        modelBuilder.Entity<VerificationStock>(entity =>
        {
            entity.HasOne(verification => verification.Article)
                .WithMany(article => article.VerificationsStock)
                .HasForeignKey(verification => verification.ArticleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(verification => verification.Emplacement)
                .WithMany(emplacement => emplacement.VerificationsStock)
                .HasForeignKey(verification => verification.EmplacementId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Signalement>(entity =>
        {
            entity.Property(signalement => signalement.SignaleParUserId).HasMaxLength(450);
            entity.Property(signalement => signalement.SignalePar).HasMaxLength(256);

            entity.HasOne(signalement => signalement.Article)
                .WithMany(article => article.Signalements)
                .HasForeignKey(signalement => signalement.ArticleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(signalement => signalement.Emplacement)
                .WithMany(emplacement => emplacement.Signalements)
                .HasForeignKey(signalement => signalement.EmplacementId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
