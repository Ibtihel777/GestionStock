using ERPStock.Application.DTOs;
using ERPStock.Application.Security;
using ERPStock.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.SuperAdmin},{AppRoles.Consultant}")]
public class DepotController : ControllerBase
{
    private readonly DepotService _service;

    public DepotController(DepotService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var depot = await _service.GetByIdAsync(id);
        return depot is null ? NotFound() : Ok(depot);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Create(CreateDepotDto dto)
    {
        try
        {
            var depot = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = depot.Id }, depot);
        }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Update(int id, CreateDepotDto dto)
    {
        try { return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound(); }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Delete(int id)
    {
        try { return await _service.DeleteAsync(id) ? NoContent() : NotFound(); }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException) { return Conflict(new { message = "Ce dépôt est encore utilisé par un emplacement ou un dépôt enfant." }); }
    }
}
