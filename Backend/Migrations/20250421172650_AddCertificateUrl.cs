using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCertificateUrl : Migration
    {
            /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // instead of creating the entire table, just add your new column:
            migrationBuilder.AddColumn<string>(
                name: "DocumentUrl",
                table: "Certificates",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // on rollback, drop only that column
            migrationBuilder.DropColumn(
                name: "DocumentUrl",
                table: "Certificates");
        }
    }
}
