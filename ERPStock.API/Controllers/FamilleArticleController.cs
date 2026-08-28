using ERPStock.Application.DTOs;
using ERPStock.Application.Security;
using ERPStock.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.SuperAdmin},{AppRoles.Consultant}")]
public class FamilleArticleController : ControllerBase
{
    private readonly FamilleArticleService _service;

    public FamilleArticleController(FamilleArticleService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var famille = await _service.GetByIdAsync(id);
        return famille is null ? NotFound() : Ok(famille);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Create(CreateFamilleArticleDto dto)
    {
        try
        {
            var famille = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = famille.Id }, famille);
        }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Update(int id, CreateFamilleArticleDto dto)
    {
        try { return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound(); }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Delete(int id)
    {
        try { return await _service.DeleteAsync(id) ? NoContent() : NotFound(); }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException) { return Conflict(new { message = "Cette famille est encore utilisée par un article ou une famille enfant." }); }
    }
}
