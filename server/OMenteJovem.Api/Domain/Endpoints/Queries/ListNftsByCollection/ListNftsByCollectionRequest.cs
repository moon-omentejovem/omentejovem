using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListNftsByCollection;

public record ListNftsByCollectionRequest(string Collection) : IRequest<ListNftsByCollectionResponse>;

public record ListNftsByCollectionResponse
(
    IEnumerable<NftArtResponse> Nfts
);

public class ListNftsByCollectionHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListNftsByCollectionRequest, ListNftsByCollectionResponse>
{
    private readonly IMongoCollection<NftArt> _nftArtCollection = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<ListNftsByCollectionResponse> Handle(ListNftsByCollectionRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftArtCollection.Find(n => n.Collection == request.Collection).ToListAsync(cancellationToken: cancellationToken);

        return new ListNftsByCollectionResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}