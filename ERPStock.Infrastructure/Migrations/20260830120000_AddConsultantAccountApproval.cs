using System;
using ERPStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPStock.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260830120000_AddConsultantAccountApproval")]
public partial class AddConsultantAccountApproval : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(
            name: "DateDemande",
            table: "AspNetUsers",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "CURRENT_TIMESTAMP");

        migrationBuilder.AddColumn<string>(
            name: "Nom",
            table: "AspNetUsers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Prenom",
            table: "AspNetUsers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "StatutApprobation",
            table: "AspNetUsers",
            type: "character varying(20)",
            maxLength: 20,
            nullable: false,
            defaultValue: "Acceptee");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "DateDemande", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "Nom", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "Prenom", table: "AspNetUsers");
        migrationBuilder.DropColumn(name: "StatutApprobation", table: "AspNetUsers");
    }
}
