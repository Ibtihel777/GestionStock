using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPStock.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStockLotsAndOutputCost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrixUnitaireSortie",
                table: "MouvementsStock",
                type: "numeric",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StockLots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuantiteRestante = table.Column<int>(type: "integer", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "numeric", nullable: false),
                    DateEntree = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ArticleId = table.Column<int>(type: "integer", nullable: false),
                    EmplacementId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockLots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockLots_Articles_ArticleId",
                        column: x => x.ArticleId,
                        principalTable: "Articles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockLots_Emplacements_EmplacementId",
                        column: x => x.EmplacementId,
                        principalTable: "Emplacements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql("""
                INSERT INTO "StockLots" ("QuantiteRestante", "PrixUnitaire", "DateEntree", "ArticleId", "EmplacementId")
                SELECT stock."Quantite", article."CMUP", article."DateCreation", stock."ArticleId", stock."EmplacementId"
                FROM "Stocks" AS stock
                INNER JOIN "Articles" AS article ON article."Id" = stock."ArticleId"
                WHERE stock."Quantite" > 0;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_StockLots_ArticleId_EmplacementId_DateEntree",
                table: "StockLots",
                columns: new[] { "ArticleId", "EmplacementId", "DateEntree" });

            migrationBuilder.CreateIndex(
                name: "IX_StockLots_EmplacementId",
                table: "StockLots",
                column: "EmplacementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockLots");

            migrationBuilder.DropColumn(
                name: "PrixUnitaireSortie",
                table: "MouvementsStock");
        }
    }
}
