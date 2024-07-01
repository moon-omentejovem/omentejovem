using Domain.Database;
using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListOneOfOneNfts;

public record ListOneOfOneNftsRequest() : IRequest<ListNftsResponse>;

public class ListOndeOfOneNftsHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListOneOfOneNftsRequest, ListNftsResponse>
{
    private readonly IMongoCollection<NftArt> _nftArtCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<ListNftsResponse> Handle(ListOneOfOneNftsRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftArtCollection.Find(n => n.OneOfOne).ToListAsync(cancellationToken: cancellationToken);

        return new ListNftsResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}