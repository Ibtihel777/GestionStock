using ERPStock.Application.DTOs;
using ERPStock.Application.Interfaces;
using ERPStock.Domain.Entities;

namespace ERPStock.Application.Services;

public class ArticleService
{
    private readonly IArticleRepository _repository;

    public ArticleService(IArticleRepository repository)
    {
        _repository = repository;
    }
    //GetAllAsync / GetByIdAsync : va chercher les entités via le Repository,
    //les transforme en DTOs
    public async Task<List<ArticleDto>> GetAllAsync()
    {
        var articles = await _repository.GetAllAsync();

        return articles.Select(a => new ArticleDto
        {
            Id = a.Id,
            Reference = a.Reference,
            Designation = a.Designation,
            ModeGestion = a.ModeGestion,
            CMUP = a.CMUP,
            UnitesParCarton = a.UnitesParCarton,
            DateCreation = a.DateCreation
        }).ToList();
    }
    
    public async Task<ArticleDto?> GetByIdAsync(int id)
    {
        var article = await _repository.GetByIdAsync(id);
        if (article == null) return null;

        return new ArticleDto
        {
            Id = article.Id,
            Reference = article.Reference,
            Designation = article.Designation,
            ModeGestion = article.ModeGestion,
            CMUP = article.CMUP,
            UnitesParCarton = article.UnitesParCarton,
            DateCreation = article.DateCreation
        };
    }

    //CreateAsync : transforme le DTO reçu en entité Article, fixe DateCreation
    //automatiquement,sauvegarde

    public async Task<ArticleDto> CreateAsync(CreateArticleDto dto)
    {
        var article = new Article
        {
            Reference = dto.Reference,
            Designation = dto.Designation,
            ModeGestion = dto.ModeGestion,
            CMUP = dto.CMUP,
            UnitesParCarton = dto.UnitesParCarton,
            DateCreation = DateTime.UtcNow
        };

        await _repository.AddAsync(article);

        return new ArticleDto
        {
            Id = article.Id,
            Reference = article.Reference,
            Designation = article.Designation,
            ModeGestion = article.ModeGestion,
            CMUP = article.CMUP,
            UnitesParCarton = article.UnitesParCarton,
            DateCreation = article.DateCreation
        };
    }
    //UpdateAsync : vérifie que l'article existe, met à jour ses champs
    public async Task<bool> UpdateAsync(int id, CreateArticleDto dto)
    {
        var article = await _repository.GetByIdAsync(id);
        if (article == null) return false;

        article.Reference = dto.Reference;
        article.Designation = dto.Designation;
        article.ModeGestion = dto.ModeGestion;
        article.CMUP = dto.CMUP;
        article.UnitesParCarton = dto.UnitesParCarton;

        await _repository.UpdateAsync(article);
        return true;
    }
    //DeleteAsync : vérifie que l'article existe avant de le supprimer
    //(évite une erreur si l'id n'existe pas)

    public async Task<bool> DeleteAsync(int id)
    {
        var article = await _repository.GetByIdAsync(id);
        if (article == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }
}
