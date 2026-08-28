using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPStock.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepotsEtFamilles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepotId",
                table: "Emplacements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FamilleArticleId",
                table: "Articles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SuiviStock",
                table: "Articles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Articles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Depots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Reference = table.Column<string>(type: "text", nullable: false),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    DepotParentId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Depots_Depots_DepotParentId",
                        column: x => x.DepotParentId,
                        principalTable: "Depots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FamillesArticles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Reference = table.Column<string>(type: "text", nullable: false),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    FamilleParentId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamillesArticles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamillesArticles_FamillesArticles_FamilleParentId",
                        column: x => x.FamilleParentId,
                        principalTable: "FamillesArticles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Les données existantes restent exploitables après la migration :
            // elles sont rattachées à des éléments racines créés une seule fois.
            migrationBuilder.Sql("""
                INSERT INTO "Depots" ("Reference", "Nom")
                SELECT 'DEPOT-PRINCIPAL', 'Dépôt principal'
                WHERE NOT EXISTS (SELECT 1 FROM "Depots" WHERE "Reference" = 'DEPOT-PRINCIPAL');

                INSERT INTO "FamillesArticles" ("Reference", "Nom")
                SELECT 'FAMILLE-NON-CLASSEE', 'Famille non classée'
                WHERE NOT EXISTS (SELECT 1 FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-NON-CLASSEE');

                UPDATE "Emplacements"
                SET "DepotId" = (SELECT "Id" FROM "Depots" WHERE "Reference" = 'DEPOT-PRINCIPAL')
                WHERE "DepotId" = 0;

                UPDATE "Articles"
                SET "FamilleArticleId" = (SELECT "Id" FROM "FamillesArticles" WHERE "Reference" = 'FAMILLE-NON-CLASSEE')
                WHERE "FamilleArticleId" = 0;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "DepotId",
                table: "Emplacements",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "FamilleArticleId",
                table: "Articles",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Emplacements_DepotId",
                table: "Emplacements",
                column: "DepotId");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_FamilleArticleId",
                table: "Articles",
                column: "FamilleArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_Depots_DepotParentId",
                table: "Depots",
                column: "DepotParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Depots_Reference",
                table: "Depots",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamillesArticles_FamilleParentId",
                table: "FamillesArticles",
                column: "FamilleParentId");

            migrationBuilder.CreateIndex(
                name: "IX_FamillesArticles_Reference",
                table: "FamillesArticles",
                column: "Reference",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Articles_FamillesArticles_FamilleArticleId",
                table: "Articles",
                column: "FamilleArticleId",
                principalTable: "FamillesArticles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Emplacements_Depots_DepotId",
                table: "Emplacements",
                column: "DepotId",
                principalTable: "Depots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Articles_FamillesArticles_FamilleArticleId",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK_Emplacements_Depots_DepotId",
                table: "Emplacements");

            migrationBuilder.DropTable(
                name: "Depots");

            migrationBuilder.DropTable(
                name: "FamillesArticles");

            migrationBuilder.DropIndex(
                name: "IX_Emplacements_DepotId",
                table: "Emplacements");

            migrationBuilder.DropIndex(
                name: "IX_Articles_FamilleArticleId",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "DepotId",
                table: "Emplacements");

            migrationBuilder.DropColumn(
                name: "FamilleArticleId",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "SuiviStock",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Articles");
        }
    }
}
