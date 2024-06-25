using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController(ILogger<HealthController> logger) : Controller
{
    [HttpGet("/health")]
    public IActionResult Index()
    {
        logger.LogInformation("Heath hit");

        return Ok("healthy");
    }
}
