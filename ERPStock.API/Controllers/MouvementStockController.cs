using ERPStock.Application.DTOs;
using ERPStock.Application.Services;
using ERPStock.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.SuperAdmin},{AppRoles.Consultant}")]
public class MouvementStockController : ControllerBase
{
    private readonly MouvementStockService _service;

    public MouvementStockController(MouvementStockService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var mouvement = await _service.GetByIdAsync(id);
        return mouvement is null ? NotFound() : Ok(mouvement);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Create([FromBody] CreateMouvementStockDto dto)
    {
        try
        {
            var mouvement = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = mouvement.Id }, mouvement);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}
