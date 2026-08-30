using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830180000_NormalizeExistingArticleUnits")]
public partial class NormalizeExistingArticleUnits : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Articles"
            SET "UniteMesure" = 'Unité'
            WHERE "UniteMesure" IS NULL
               OR BTRIM("UniteMesure") = ''
               OR "UniteMesure" = 'UnitÃ©';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
