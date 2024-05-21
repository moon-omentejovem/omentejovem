using Domain.Database;
using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListNftsByCollection;

public record ListNftsByCollectionRequest(string Collection) : IRequest<ListNftsResponse>;

public class ListNftsByCollectionHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListNftsByCollectionRequest, ListNftsResponse>
{
    private readonly IMongoCollection<NftArt> _nftArtCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<ListNftsResponse> Handle(ListNftsByCollectionRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftArtCollection.Find(n => n.Collection == request.Collection).ToListAsync(cancellationToken: cancellationToken);

        return new ListNftsResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}