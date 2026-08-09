using ERPStock.Application.DTOs;
using ERPStock.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleController : ControllerBase
{
    private readonly ArticleService _service;

    public ArticleController(ArticleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var articles = await _service.GetAllAsync();
        return Ok(articles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var article = await _service.GetByIdAsync(id);
        if (article == null) return NotFound();
        return Ok(article);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateArticleDto dto)
    {
        var article = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateArticleDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}