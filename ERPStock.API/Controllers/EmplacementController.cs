using ERPStock.Application.DTOs;
using ERPStock.Application.Services;
using ERPStock.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.SuperAdmin},{AppRoles.Consultant}")]
public class EmplacementController : ControllerBase
{
    private readonly EmplacementService _service;

    public EmplacementController(EmplacementService service)
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
        var emplacement = await _service.GetByIdAsync(id);
        return emplacement is null ? NotFound() : Ok(emplacement);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Create([FromBody] CreateEmplacementDto dto)
    {
        var emplacement = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = emplacement.Id }, emplacement);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Update(int id, [FromBody] CreateEmplacementDto dto)
    {
        return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public async Task<IActionResult> Delete(int id)
    {
        return await _service.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
