using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListEditionNfts;

public record ListEditionNftsRequest() : IRequest<ListNftsResponse>;

public class ListEditionNftsHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListEditionNftsRequest, ListNftsResponse>
{
    private readonly IMongoCollection<NftArt> _nftArtCollection = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<ListNftsResponse> Handle(ListEditionNftsRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftArtCollection.Find(n => n.Edition).ToListAsync(cancellationToken: cancellationToken);

        return new ListNftsResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}