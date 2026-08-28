using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations
{
    public partial class CleanHistoriesAndSeedOrganisation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"Signalements\";");
            migrationBuilder.Sql("DELETE FROM \"VerificationsStock\";");

            migrationBuilder.Sql("""
                INSERT INTO "Depots" ("Reference", "Nom", "DepotParentId")
                SELECT 'DEPOT-ATELIER', 'Dépôt atelier', "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-PRINCIPAL'
                AND NOT EXISTS (SELECT 1 FROM "Depots" WHERE "Reference" = 'DEPOT-ATELIER');
                INSERT INTO "Depots" ("Reference", "Nom", "DepotParentId")
                SELECT 'DEPOT-RESERVE', 'Dépôt réserve', "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-PRINCIPAL'
                AND NOT EXISTS (SELECT 1 FROM "Depots" WHERE "Reference" = 'DEPOT-RESERVE');
                INSERT INTO "Depots" ("Reference", "Nom", "DepotParentId")
                SELECT 'DEPOT-EXPEDITION', 'Dépôt expédition', "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-PRINCIPAL'
                AND NOT EXISTS (SELECT 1 FROM "Depots" WHERE "Reference" = 'DEPOT-EXPEDITION');

                UPDATE "Emplacements" SET "DepotId" = (SELECT "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-ATELIER')
                WHERE "Code_Emplacement" LIKE 'ATELIER-%';
                UPDATE "Emplacements" SET "DepotId" = (SELECT "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-RESERVE')
                WHERE "Code_Emplacement" LIKE 'RESERVE-%';
                UPDATE "Emplacements" SET "DepotId" = (SELECT "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-EXPEDITION')
                WHERE "Code_Emplacement" LIKE 'EXPEDITION-%';

                INSERT INTO "FamillesArticles" ("Reference", "Nom")
                SELECT 'FAMILLE-INDUSTRIELLE', 'Fournitures industrielles'
                WHERE NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-INDUSTRIELLE');
                INSERT INTO "FamillesArticles" ("Reference", "Nom", "FamilleParentId")
                SELECT 'FAMILLE-MECANIQUE', 'Composants mécaniques', "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-INDUSTRIELLE'
                AND NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-MECANIQUE');
                INSERT INTO "FamillesArticles" ("Reference", "Nom", "FamilleParentId")
                SELECT 'FAMILLE-ELECTRIQUE', 'Composants électriques', "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-INDUSTRIELLE'
                AND NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-ELECTRIQUE');
                INSERT INTO "FamillesArticles" ("Reference", "Nom")
                SELECT 'FAMILLE-CONSOMMABLES', 'Consommables et sécurité'
                WHERE NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-CONSOMMABLES');
                INSERT INTO "FamillesArticles" ("Reference", "Nom", "FamilleParentId")
                SELECT 'FAMILLE-EPI', 'Équipements de protection', "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-CONSOMMABLES'
                AND NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-EPI');

                UPDATE "Articles" SET "FamilleArticleId" = (SELECT "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-MECANIQUE')
                WHERE "Reference" IN ('DEMO-VIS-001', 'DEMO-POM-003', 'DEMO-ROU-004', 'DEMO-FIL-007');
                UPDATE "Articles" SET "FamilleArticleId" = (SELECT "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-ELECTRIQUE')
                WHERE "Reference" IN ('DEMO-CAB-002', 'DEMO-CAP-006', 'DEMO-MOT-008', 'DEMO-ETI-009');
                UPDATE "Articles" SET "FamilleArticleId" = (SELECT "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-EPI')
                WHERE "Reference" = 'DEMO-GAN-005';
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Les historiques supprimés ne peuvent pas être reconstitués automatiquement.
        }
    }
}
