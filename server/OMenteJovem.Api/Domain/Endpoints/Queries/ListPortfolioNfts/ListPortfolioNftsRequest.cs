using Domain.Database;
using Domain.Endpoints.Models;
using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListPortfolioNfts;

public record ListPortfolioNftsRequest() : IRequest<ListNftsResponse>;

public class ListPortfolioNftsHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListPortfolioNftsRequest, ListNftsResponse>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<ListNftsResponse> Handle(ListPortfolioNftsRequest request, CancellationToken cancellationToken)
    {
        var nfts = await _nftsCollection.Find(x => x.NftUrl != null).ToListAsync(cancellationToken: cancellationToken);

        return new ListNftsResponse(nfts.Select(NftArtResponse.FromDomain));
    }
}