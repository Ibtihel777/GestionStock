using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830160000_RemoveArticleCartonManagement")]
public partial class RemoveArticleCartonManagement : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "UnitesParCarton",
            table: "Articles");

        migrationBuilder.AddColumn<string>(
            name: "UniteMesure",
            table: "Articles",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "Unit\u00e9");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "UniteMesure",
            table: "Articles");

        migrationBuilder.AddColumn<int>(
            name: "UnitesParCarton",
            table: "Articles",
            type: "integer",
            nullable: true);
    }
}
