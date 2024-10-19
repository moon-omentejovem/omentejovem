using Domain.Database;
using Domain.Models;
using Domain.Models.Enums;
using Domain.OpenSea;
using Domain.OpenSea.Models.GetNft;
using Domain.Services;
using Domain.Utils;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateOpenSeaNft;

public record CreateOpenSeaNftRequest(
    NftResponse NftResponse
) : IRequest<NftArt?>;

public class CreateOpenSeaNftRequestHandler(
    IMongoDatabase mongoDatabase,
    UploadImagesService uploadService,
    OpenSeaClient openSeaClient
) : IRequestHandler<CreateOpenSeaNftRequest, NftArt?>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<NftArt?> Handle(CreateOpenSeaNftRequest request, CancellationToken cancellationToken)
    {
        var mappedNft = MapFromResponse(request.NftResponse);

        var existentNft = await _nftsCollection.Find(n =>
            n.Name == mappedNft.Name &&
            n.Collection == mappedNft.Collection
        )
        .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        var isNftBurned = await IsNftBurned(mappedNft.Address, mappedNft.SourceId);

        if (isNftBurned)
        {
            return null;
        }

        if (existentNft == null)
        {
            await _nftsCollection.InsertOneAsync(mappedNft, cancellationToken: cancellationToken);

            await uploadService.OptimizeImages(mappedNft);

            return mappedNft;
        }

        existentNft.NftChain = NftChain.Ethereum;
        existentNft.Collection = mappedNft.Collection;
        existentNft.ExternalLinks.AddLink(mappedNft.ExternalLinks.Links.First());
        existentNft.AddContract(mappedNft.Contracts.First());
        existentNft.SourceId = mappedNft.SourceId;

        if (mappedNft.Owners.Count > 0)
        {
            existentNft.Owners = mappedNft.Owners;
        }

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);

        if (!AreImagesReady(existentNft))
        {
            await uploadService.OptimizeImages(existentNft);
        }

        return existentNft;
    }

    private static bool AreImagesReady(NftArt nftArt)
    {
        if (nftArt.OptimizedImages == null)
            return false;
        if (string.IsNullOrEmpty(nftArt.OptimizedImages.OriginalCompression))
            return false;

        if (!nftArt.OptimizedImages.ResizedImages.Any(i => i.Height == 720))
            return false;
        if (!nftArt.OptimizedImages.ResizedImages.Any(i => i.Height == 1080))
            return false;

        return true;
    }

    private static NftArt MapFromResponse(NftResponse nftResponse)
    {
        return new NftArt
        {
            Name = nftResponse.Name,
            Description = nftResponse.Description,
            Address = nftResponse.Contract,
            SourceId = nftResponse.Identifier,
            Collection = nftResponse.Collection,
            NftUrl = nftResponse.ImageUrl,
            NftChain = NftChain.Ethereum,
            ExternalLinks = new(new() { Name = ExternalLinkEnum.OpenSea, Url = nftResponse.OpenseaUrl }),
            Edition = nftResponse.TokenStandard == "erc1155" || nftResponse.Collection.Contains("edition", StringComparison.InvariantCultureIgnoreCase),
            Owners = nftResponse.Owners?.Select(o => new Owner
            {
                Address = o.Address,
                Quantity = o.Quantity
            }).ToList() ?? [],
            Contracts = [
                new Contract
                {
                    ContractAddress = nftResponse.Contract,
                    NftChain = NftChain.Ethereum,
                    SourceId = nftResponse.Identifier
                }
            ],
        };
    }

    private async Task<bool> IsNftBurned(string address, string sourceId)
    {
        var nftEventsResponse = await openSeaClient.GetNftEvents(address, sourceId)
            ?? throw new Exception("Something went really wrong");
        var lastEvent = nftEventsResponse.AssetEvents.OrderByDescending(e => e.EventTimestamp).FirstOrDefault();

        if (lastEvent is null)
        {
            return false;
        }

        return lastEvent.ToAddress == NftConstants.NullAddress;
    }
}