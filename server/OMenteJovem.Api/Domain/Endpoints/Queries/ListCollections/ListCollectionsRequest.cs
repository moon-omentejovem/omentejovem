using Domain.Database;
using Domain.Models;
using Domain.Utils;
using MediatR;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.ListCollections;

public record ListCollectionsRequest : IRequest<ListCollectionsResponse>;

public class ListCollectionsHandler(ILogger<ListCollectionsHandler> logger, IMongoDatabase mongoDatabase) : IRequestHandler<ListCollectionsRequest, ListCollectionsResponse>
{
    private readonly IMongoCollection<Collection> _collections = mongoDatabase.GetCollection<Collection>(MongoDbConfig.CollectionsCollectionName);
    private readonly IMongoCollection<NftArt> _nfts = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    private const string FetchCollectionsQueryName = "fetchAllCollections";
    private const string FetchCollectionNftsQueryName = "fetchNftsByCollection";

    public async Task<ListCollectionsResponse> Handle(ListCollectionsRequest request, CancellationToken cancellationToken)
    {
        var collections = await LogTimer.LogTimestampAsync(
            logger,
            () => _collections.Find(c => c.Visible).SortBy(c => c.Year).ToListAsync(cancellationToken: cancellationToken),
            FetchCollectionsQueryName
        );
        collections = collections.Where(c => !c.Name.Contains("Edition", StringComparison.InvariantCultureIgnoreCase)).ToList();

        var responseList = new List<CollectionResponse>();

        foreach (var collection in collections)
        {
            var collectionNfts = await LogTimer.LogTimestampAsync(
                logger,
                () => _nfts.Find(n =>
                        n.Collection == collection.SourceId &&
                        n.NftUrl != null
                    ).ToListAsync(),
                FetchCollectionNftsQueryName
            );

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
            NftImageUrls: collectionNfts.Take(5).Select(GetBestCollectionImage)
        );
    }

    private static string GetBestCollectionImage(NftArt nftArt)
    {
        if (nftArt.OptimizedImages is null)
        {
            return nftArt.NftUrl;
        }

        var hdResizedImage = nftArt.OptimizedImages.ResizedImages.FirstOrDefault(i => i.Height == 720);
        if (hdResizedImage != null)
        {
            return hdResizedImage.Source;
        }

        var fullHdResizedImage = nftArt.OptimizedImages.ResizedImages.FirstOrDefault(i => i.Height == 1080);
        if (fullHdResizedImage != null)
        {
            return fullHdResizedImage.Source;
        }

        return nftArt.OptimizedImages.OriginalCompression;
    }
}