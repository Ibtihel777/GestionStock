using ERPStock.Application.DTOs;
using ERPStock.Application.Services;
using ERPStock.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AppRoles.SuperAdmin},{AppRoles.Consultant}")]
public class StockController : ControllerBase
{
    private readonly StockService _service;

    public StockController(StockService service)
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
        var stock = await _service.GetByIdAsync(id);
        return stock is null ? NotFound() : Ok(stock);
    }

}
