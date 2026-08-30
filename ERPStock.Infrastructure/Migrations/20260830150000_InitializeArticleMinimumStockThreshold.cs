using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830150000_InitializeArticleMinimumStockThreshold")]
public partial class InitializeArticleMinimumStockThreshold : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE \"Articles\" SET \"SeuilMinimum\" = 10 WHERE \"SeuilMinimum\" <= 0;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
