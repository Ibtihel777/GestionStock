using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830143000_AddArticleMinimumStockThreshold")]
public partial class AddArticleMinimumStockThreshold : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "SeuilMinimum",
            table: "Articles",
            type: "integer",
            nullable: false,
            defaultValue: 10);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "SeuilMinimum",
            table: "Articles");
    }
}
