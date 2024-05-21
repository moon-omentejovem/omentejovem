using Domain.Endpoints.Models;
using Domain.Endpoints.Queries.ListEditionNfts;
using Domain.Endpoints.Queries.ListNftsByCollection;
using Domain.Endpoints.Queries.ListOneOfOneNfts;
using Domain.Endpoints.Queries.ListPortfolioNfts;
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
    public async Task<ListNftsResponse> ListCollections(string collection)
    {
        return await mediator.Send(new ListNftsByCollectionRequest(collection));
    }

    [HttpGet("/nfts/edition")]
    public async Task<ListNftsResponse> ListEditions()
    {
        return await mediator.Send(new ListEditionNftsRequest());
    }

    [HttpGet("/nfts")]
    public async Task<ListNftsResponse> ListPortfolioNfts()
    {
        return await mediator.Send(new ListPortfolioNftsRequest());
    }

    [HttpGet("/nfts/one-of-one")]
    public async Task<ListNftsResponse> ListOneOfOneNfts()
    {
        return await mediator.Send(new ListOneOfOneNftsRequest());
    }
}