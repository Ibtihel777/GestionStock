using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPStock.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificationStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VerificationsStock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateVerification = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    QuantiteTheorique = table.Column<int>(type: "integer", nullable: false),
                    QuantiteDetectee = table.Column<int>(type: "integer", nullable: false),
                    Ecart = table.Column<int>(type: "integer", nullable: false),
                    PhotoUrl = table.Column<string>(type: "text", nullable: true),
                    ArticleId = table.Column<int>(type: "integer", nullable: false),
                    EmplacementId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificationsStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerificationsStock_Articles_ArticleId",
                        column: x => x.ArticleId,
                        principalTable: "Articles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VerificationsStock_Emplacements_EmplacementId",
                        column: x => x.EmplacementId,
                        principalTable: "Emplacements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VerificationsStock_ArticleId",
                table: "VerificationsStock",
                column: "ArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_VerificationsStock_EmplacementId",
                table: "VerificationsStock",
                column: "EmplacementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VerificationsStock");
        }
    }
}
