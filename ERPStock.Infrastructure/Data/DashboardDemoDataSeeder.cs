using ERPStock.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ERPStock.Infrastructure.Data;

public static class DashboardDemoDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (await context.Articles.AnyAsync(article => article.Reference.StartsWith("DEMO-")))
            return;

        var emplacements = new[]
        {
            new Emplacement { Zone = "Atelier", Etagere = "A1", Tiroir = "01", Code_Emplacement = "ATELIER-A1-01" },
            new Emplacement { Zone = "Atelier", Etagere = "A1", Tiroir = "02", Code_Emplacement = "ATELIER-A1-02" },
            new Emplacement { Zone = "Réserve", Etagere = "B2", Tiroir = "01", Code_Emplacement = "RESERVE-B2-01" },
            new Emplacement { Zone = "Réserve", Etagere = "B2", Tiroir = "02", Code_Emplacement = "RESERVE-B2-02" },
            new Emplacement { Zone = "Expédition", Etagere = "E1", Tiroir = "01", Code_Emplacement = "EXPEDITION-E1-01" }
        };
        var articles = new[]
        {
            CreateArticle("DEMO-VIS-001", "Vis inox M6", "CMUP", 0.85m, 160),
            CreateArticle("DEMO-CAB-002", "Câble industriel 5 m", "CMUP", 18.40m, 145),
            CreateArticle("DEMO-POM-003", "Pompe de circulation", "CMUP", 245m, 130),
            CreateArticle("DEMO-ROU-004", "Roulement 6204", "CMUP", 12.75m, 115),
            CreateArticle("DEMO-GAN-005", "Gants de protection", "CMUP", 6.20m, 95),
            CreateArticle("DEMO-CAP-006", "Capteur de proximité", "CMUP", 76m, 75),
            CreateArticle("DEMO-FIL-007", "Filtre hydraulique", "CMUP", 31.50m, 60),
            CreateArticle("DEMO-MOT-008", "Moteur électrique", "CMUP", 680m, 45),
            CreateArticle("DEMO-ETI-009", "Étiquette thermique", "CMUP", 0.18m, 35)
        };

        context.Emplacements.AddRange(emplacements);
        context.Articles.AddRange(articles);
        await context.SaveChangesAsync();

        context.Stocks.AddRange(
            Stock(articles[0], emplacements[0], 350), Stock(articles[0], emplacements[2], 130),
            Stock(articles[1], emplacements[2], 170), Stock(articles[1], emplacements[4], 80),
            Stock(articles[2], emplacements[0], 9), Stock(articles[3], emplacements[3], 32),
            Stock(articles[4], emplacements[4], 74), Stock(articles[5], emplacements[1], 3),
            Stock(articles[6], emplacements[2], 21), Stock(articles[7], emplacements[3], 2),
            Stock(articles[8], emplacements[4], 480));

        context.MouvementsStock.AddRange(
            Movement(articles[0], TypeMouvementStock.Entree, 240, 57, destination: emplacements[0], price: 0.78m),
            Movement(articles[1], TypeMouvementStock.Entree, 120, 53, destination: emplacements[2], price: 17.50m),
            Movement(articles[2], TypeMouvementStock.Entree, 8, 49, destination: emplacements[0], price: 238m),
            Movement(articles[3], TypeMouvementStock.Entree, 45, 44, destination: emplacements[3], price: 12.20m),
            Movement(articles[4], TypeMouvementStock.Entree, 90, 40, destination: emplacements[4], price: 5.90m),
            Movement(articles[6], TypeMouvementStock.Entree, 30, 37, destination: emplacements[2], price: 30m),
            Movement(articles[8], TypeMouvementStock.Entree, 600, 34, destination: emplacements[4], price: 0.16m),
            Movement(articles[0], TypeMouvementStock.Sortie, 35, 29, source: emplacements[0]),
            Movement(articles[1], TypeMouvementStock.Sortie, 20, 27, source: emplacements[2]),
            Movement(articles[4], TypeMouvementStock.Sortie, 16, 25, source: emplacements[4]),
            Movement(articles[8], TypeMouvementStock.Sortie, 80, 23, source: emplacements[4]),
            Movement(articles[5], TypeMouvementStock.Entree, 6, 21, destination: emplacements[1], price: 74m),
            Movement(articles[7], TypeMouvementStock.Entree, 3, 19, destination: emplacements[3], price: 665m),
            Movement(articles[0], TypeMouvementStock.Transfert, 80, 17, source: emplacements[0], destination: emplacements[2]),
            Movement(articles[1], TypeMouvementStock.Entree, 150, 15, destination: emplacements[4], price: 19.10m),
            Movement(articles[3], TypeMouvementStock.Sortie, 13, 12, source: emplacements[3]),
            Movement(articles[6], TypeMouvementStock.Sortie, 9, 10, source: emplacements[2]),
            Movement(articles[0], TypeMouvementStock.Sortie, 25, 8, source: emplacements[2]),
            Movement(articles[4], TypeMouvementStock.Entree, 25, 6, destination: emplacements[4], price: 6.40m),
            Movement(articles[8], TypeMouvementStock.Sortie, 40, 4, source: emplacements[4]),
            Movement(articles[1], TypeMouvementStock.Sortie, 30, 2, source: emplacements[4]),
            Movement(articles[0], TypeMouvementStock.Entree, 120, 1, destination: emplacements[0], price: 0.88m));

        context.VerificationsStock.AddRange(
            Verification(articles[0], emplacements[0], 350, 350, 20),
            Verification(articles[4], emplacements[4], 74, 71, 17),
            Verification(articles[1], emplacements[2], 170, 170, 14),
            Verification(articles[5], emplacements[1], 3, 2, 9),
            Verification(articles[6], emplacements[2], 21, 21, 6),
            Verification(articles[2], emplacements[0], 9, 8, 3));

        context.Signalements.AddRange(
            Signalement(articles[0], emplacements[0], 310, 307, 170, StatutSignalement.Traite),
            Signalement(articles[1], emplacements[2], 150, 146, 140, StatutSignalement.Traite),
            Signalement(articles[4], emplacements[4], 65, 61, 105, StatutSignalement.Traite),
            Signalement(articles[3], emplacements[3], 40, 38, 74, StatutSignalement.Traite),
            Signalement(articles[8], emplacements[4], 520, 515, 49, StatutSignalement.Traite),
            Signalement(articles[5], emplacements[1], 3, 2, 18, StatutSignalement.EnAttente),
            Signalement(articles[2], emplacements[0], 9, 8, 4, StatutSignalement.EnAttente),
            Signalement(articles[4], emplacements[4], 74, 71, 1, StatutSignalement.EnAttente));

        await context.SaveChangesAsync();
    }

    private static Article CreateArticle(string reference, string designation, string modeGestion, decimal cmup, int createdDaysAgo) => new()
    {
        Reference = reference,
        Designation = designation,
        ModeGestion = modeGestion,
        CMUP = cmup,
        DateCreation = DateTime.UtcNow.AddDays(-createdDaysAgo)
    };

    private static Stock Stock(Article article, Emplacement emplacement, int quantity) => new()
    {
        Article = article,
        Emplacement = emplacement,
        Quantite = quantity
    };

    private static MouvementStock Movement(Article article, TypeMouvementStock type, int quantity, int daysAgo, Emplacement? source = null, Emplacement? destination = null, decimal? price = null) => new()
    {
        Article = article,
        Type = type,
        Quantite = quantity,
        DateMouvement = DateTime.UtcNow.AddDays(-daysAgo).AddHours(9),
        EmplacementSource = source,
        EmplacementDestination = destination,
        PrixUnitaireEntree = price
    };

    private static VerificationStock Verification(Article article, Emplacement emplacement, int theoretical, int detected, int daysAgo) => new()
    {
        Article = article,
        Emplacement = emplacement,
        QuantiteTheorique = theoretical,
        QuantiteDetectee = detected,
        Ecart = detected - theoretical,
        DateVerification = DateTime.UtcNow.AddDays(-daysAgo).AddHours(11)
    };

    private static Signalement Signalement(Article article, Emplacement emplacement, int theoretical, int detected, int daysAgo, StatutSignalement statut) => new()
    {
        Article = article,
        Emplacement = emplacement,
        QuantiteTheorique = theoretical,
        QuantiteDetectee = detected,
        Ecart = detected - theoretical,
        Statut = statut,
        SignalePar = "Jeu de démonstration",
        SignaleParUserId = "dashboard-demo",
        DateSignalement = DateTime.UtcNow.AddDays(-daysAgo).AddHours(11)
    };
}
