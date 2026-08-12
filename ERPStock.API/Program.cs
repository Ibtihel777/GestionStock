using ERPStock.Infrastructure.Data;
using ERPStock.Application.Interfaces;
using ERPStock.Application.Services;
using ERPStock.Infrastructure.Repositories;
using ERPStock.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddScoped<IArticleRepository, ArticleRepository>();
builder.Services.AddScoped<IEmplacementRepository, EmplacementRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IMouvementStockRepository, MouvementStockRepository>();
builder.Services.AddScoped<IVerificationStockRepository, VerificationStockRepository>();

builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<EmplacementService>();
builder.Services.AddScoped<StockService>();
builder.Services.AddScoped<MouvementStockService>();
builder.Services.AddScoped<VerificationStockService>();
builder.Services.AddHttpClient<IVisionService, GeminiVisionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
