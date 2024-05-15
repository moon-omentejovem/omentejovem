using Domain.Endpoints.Queries.ListNftsByCollection;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class NftsController(
    IMediator mediator,
    ILogger<NftsController> logger
) : ControllerBase
{
    [HttpGet("/nfts/collections/{collection}")]
    public async Task<ListNftsByCollectionResponse> ListCollections(string collection)
    {
        return await mediator.Send(new ListNftsByCollectionRequest(collection));
    }
}