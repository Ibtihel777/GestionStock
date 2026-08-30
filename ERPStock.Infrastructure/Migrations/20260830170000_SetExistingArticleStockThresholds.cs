using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830170000_SetExistingArticleStockThresholds")]
public partial class SetExistingArticleStockThresholds : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            WITH stock_total AS (
                SELECT "ArticleId", SUM("Quantite")::integer AS "QuantiteTotale"
                FROM "Stocks"
                GROUP BY "ArticleId"
            )
            UPDATE "Articles" AS article
            SET "SeuilMinimum" = CASE
                WHEN COALESCE(stock_total."QuantiteTotale", 0) = 0 THEN 10
                WHEN MOD(article."Id", 3) = 0 THEN stock_total."QuantiteTotale"
                WHEN MOD(article."Id", 3) = 1 THEN GREATEST(1, (stock_total."QuantiteTotale" + 1) / 2)
                ELSE GREATEST(1, stock_total."QuantiteTotale" / 3)
            END
            FROM stock_total
            WHERE stock_total."ArticleId" = article."Id";
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
