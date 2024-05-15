using Domain.Endpoints.Queries.ListCollections;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class CollectionsController(
    IMediator mediator,
    ILogger<CollectionsController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<ListCollectionsResponse> ListCollections()
    {
        return await mediator.Send(new ListCollectionsRequest());
    }
}
