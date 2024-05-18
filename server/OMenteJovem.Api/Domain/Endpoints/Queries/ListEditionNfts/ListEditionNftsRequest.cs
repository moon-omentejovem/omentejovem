using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListEditionNfts;

public record ListEditionNftsRequest() : IRequest<ListEditionNftsResponse>;

public class ListEditionNftsHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListEditionNftsRequest, ListEditionNftsResponse>
{
    private readonly IMongoCollection<NftArt> _nftArtCollection = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<ListEditionNftsResponse> Handle(ListEditionNftsRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftArtCollection.Find(n => n.Edition).ToListAsync(cancellationToken: cancellationToken);

        return new ListEditionNftsResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}