using Domain.Models;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListCollections;

public record ListCollectionsRequest : IRequest<ListCollectionsResponse>
{
}

public class ListCollectionsHandler(IMongoDatabase mongoDatabase) : IRequestHandler<ListCollectionsRequest, ListCollectionsResponse>
{
    private readonly IMongoCollection<Collection> _collections = mongoDatabase.GetCollection<Collection>("collections");
    private readonly IMongoCollection<NftArt> _nftCollections = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<ListCollectionsResponse> Handle(ListCollectionsRequest request, CancellationToken cancellationToken)
    {
        var collections = await _collections.Find(_ => true).ToListAsync(cancellationToken: cancellationToken);
        collections = collections.Where(c => !c.Name.Contains("Edition", StringComparison.InvariantCultureIgnoreCase)).ToList();

        var responseList = new List<CollectionResponse>();

        foreach (var collection in collections)
        {
            var collectionNfts = await _nftCollections.Find(n =>
                n.Collection == collection.SourceId &&
                n.NftUrl != null
            ).ToListAsync();

            var response = MapToCollection(collection, collectionNfts);

            responseList.Add(response);
        }

        return new ListCollectionsResponse(responseList);
    }

    private static CollectionResponse MapToCollection(Collection collection, List<NftArt> collectionNfts)
    {
        return new CollectionResponse(
            Name: collection.Name,
            Year: collection.Year,
            Slug: collection.SourceId,
            NftImageUrls: collectionNfts.Take(5).Select(n => n.NftUrl!)
        );
    }
}