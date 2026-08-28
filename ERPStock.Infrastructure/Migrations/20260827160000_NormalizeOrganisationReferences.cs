using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[Migration("20260827160000_NormalizeOrganisationReferences")]
public partial class NormalizeOrganisationReferences : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Depots" SET "Reference" = 'DEP-001' WHERE "Reference" = 'DEPOT-PRINCIPAL';
            UPDATE "Depots" SET "Reference" = 'DEP-002' WHERE "Reference" = 'DEPOT-ATELIER';
            UPDATE "Depots" SET "Reference" = 'DEP-003' WHERE "Reference" = 'DEPOT-RESERVE';
            UPDATE "Depots" SET "Reference" = 'DEP-004' WHERE "Reference" = 'DEPOT-EXPEDITION';
            UPDATE "Depots" SET "Reference" = 'DEP-900' WHERE "Reference" = 'DEMO-PRINCIPAL';

            UPDATE "FamillesArticles" SET "Reference" = 'FAM-001' WHERE "Reference" = 'FAMILLE-NON-CLASSEE';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-002' WHERE "Reference" = 'FAMILLE-INDUSTRIELLE';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-003' WHERE "Reference" = 'FAMILLE-MECANIQUE';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-004' WHERE "Reference" = 'FAMILLE-ELECTRIQUE';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-005' WHERE "Reference" = 'FAMILLE-CONSOMMABLES';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-006' WHERE "Reference" = 'FAMILLE-EPI';
            UPDATE "FamillesArticles" SET "Reference" = 'FAM-900' WHERE "Reference" = 'DEMO-GENERAL';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Depots" SET "Reference" = 'DEPOT-PRINCIPAL' WHERE "Reference" = 'DEP-001';
            UPDATE "Depots" SET "Reference" = 'DEPOT-ATELIER' WHERE "Reference" = 'DEP-002';
            UPDATE "Depots" SET "Reference" = 'DEPOT-RESERVE' WHERE "Reference" = 'DEP-003';
            UPDATE "Depots" SET "Reference" = 'DEPOT-EXPEDITION' WHERE "Reference" = 'DEP-004';
            UPDATE "Depots" SET "Reference" = 'DEMO-PRINCIPAL' WHERE "Reference" = 'DEP-900';

            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-NON-CLASSEE' WHERE "Reference" = 'FAM-001';
            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-INDUSTRIELLE' WHERE "Reference" = 'FAM-002';
            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-MECANIQUE' WHERE "Reference" = 'FAM-003';
            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-ELECTRIQUE' WHERE "Reference" = 'FAM-004';
            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-CONSOMMABLES' WHERE "Reference" = 'FAM-005';
            UPDATE "FamillesArticles" SET "Reference" = 'FAMILLE-EPI' WHERE "Reference" = 'FAM-006';
            UPDATE "FamillesArticles" SET "Reference" = 'DEMO-GENERAL' WHERE "Reference" = 'FAM-900';
            """);
    }
}
