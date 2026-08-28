using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[Migration("20260827170000_RemoveOrganisationReferenceConstraints")]
public partial class RemoveOrganisationReferenceConstraints : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Depots_Reference",
            table: "Depots");

        migrationBuilder.DropIndex(
            name: "IX_FamillesArticles_Reference",
            table: "FamillesArticles");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_Depots_Reference",
            table: "Depots",
            column: "Reference",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_FamillesArticles_Reference",
            table: "FamillesArticles",
            column: "Reference",
            unique: true);
    }
}
