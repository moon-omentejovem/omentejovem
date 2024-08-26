using Domain.Database;
using Domain.Models;
using Domain.Utils;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Queries.GetHomeInfo;

public record GetHomeInfoRequest() : IRequest<GetHomeInfoResponse>;

public class GetHomeInfoHandler(IMongoDatabase mongoDatabase) : IRequestHandler<GetHomeInfoRequest, GetHomeInfoResponse>
{
    private readonly IMongoCollection<HomeSettings> _homeSettingsCollection = mongoDatabase.GetCollection<HomeSettings>(MongoDbConfig.HomeSettingsCollectionName);
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<GetHomeInfoResponse> Handle(GetHomeInfoRequest request, CancellationToken cancellationToken)
    {
        var homeSettings = await _homeSettingsCollection.Find(_ => true).FirstOrDefaultAsync();

        if (homeSettings == null)
        {
            var nfts = await _nftsCollection.Find(n =>
                n.OptimizedImages.OriginalCompression != null &&
                n.OptimizedImages.OriginalCompression != "" &&
                n.MintedEvent != null
            ).Limit(7).Project(n => new
            {
                n.Name,
                n.MintedEvent,
                n.OptimizedImages.OriginalCompression
            }).ToListAsync(cancellationToken);

            return new GetHomeInfoResponse("Thales Machado", "omentejovem", nfts.Select(n => new GetHomeInfoNftResponse(
                Title: n.Name, 
                CreatedAt: NftConstants.ParsePosixTimestamp(n.MintedEvent!.EventTimestamp), 
                ImageUrl: n.OriginalCompression
            )));
        }

        return new GetHomeInfoResponse(homeSettings.Title, homeSettings.Subtitle, homeSettings.NftIds.Select(n => new GetHomeInfoNftResponse(
            Title: n.Name,
            CreatedAt: n.CreatedAt,
            ImageUrl: n.Url)
        ));
    }
}
