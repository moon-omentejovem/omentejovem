using Domain.Endpoints.Queries.GetHomeInfo;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class HomeController(
    IMediator mediator
) : ControllerBase
{
    [HttpGet("/home")]
    public async Task<GetHomeInfoResponse> GetHomeInfo()
    {
        return await mediator.Send(new GetHomeInfoRequest());
    }
}