
using DbSeeder.Objkt;
using DbSeeder.Objkt.Mappers;
using DbSeeder.OpenSea;
using DbSeeder.OpenSea.Mappers;
using Domain.Endpoints.Commands.CreateCollection;
using Domain.Endpoints.Commands.CreateNftEvents;
using Domain.Endpoints.Commands.CreateObjktNft;
using Domain.Endpoints.Commands.CreateOpenSeaNft;
using Domain.Endpoints.Commands.UpdateOwners;
using Domain.Models;
using Domain.Models.Enums;
using Domain.OpenSea;
using Domain.OpenSea.Mappers;
using Domain.OpenSea.Models.GetNft;
using MediatR;
using MongoDB.Bson;

namespace DbSeeder;

public class Worker : BackgroundService
{
    private const int MillisecondsDelay = 60 * 60 * 1000;
    private readonly ILogger<Worker> _logger;
    private readonly OpenSeaClient _openSeaClient;
    private readonly ObjktClient _objktClient;
    private readonly OpenSeaConfig _openSeaConfig;
    private readonly IMediator _mediator;

    public Worker(
        ILogger<Worker> logger,
        OpenSeaClient openSeaClient,
        ObjktClient objktClient,
        OpenSeaConfig openSeaConfig,
        IMediator mediator)
    {
        _logger = logger;
        _openSeaClient = openSeaClient;
        _objktClient = objktClient;
        _mediator = mediator;
        _openSeaConfig = openSeaConfig;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await SeedOpenSeaCollections();

            await SeedOpenSeaNfts();

            await SeedObjktNfts();

            await Task.Delay(MillisecondsDelay, stoppingToken);
        }
    }

    private async Task SeedOpenSeaCollections()
    {
        var collectionsResponse = await _openSeaClient.GetCollections();

        foreach (var collection in collectionsResponse.Collections)
        {
            var collectionResponse = await _openSeaClient.GetCollection(collection.Collection);

            await _mediator.Send(new CreateCollectionRequest(
                Name: collectionResponse.Name,
                SourceId: collection.Collection,
                Address: collectionResponse.Contracts.FirstOrDefault()?.Address ?? string.Empty,
                Description: collectionResponse.Description,
                Year: collectionResponse.CreatedDate.Year.ToString(),
                NftChain: NftChain.Ethereum
            ));

            await SeedOpenSeaNftsByCollection(collection.Collection);
        }
    }

    private async Task SeedOpenSeaNftsByCollection(string collectionSlug)
    {
        var nftsResponse = await _openSeaClient.ListNftsByCollection(collectionSlug);

        foreach (var nft in nftsResponse.Nfts)
        {
            var singleNftResponse = await _openSeaClient.GetNft(NftChain.Ethereum.ToString(), nft.Contract, nft.Identifier);

            await HandleSingleNftRequest(singleNftResponse.Nft, false);
        }
    }

    private async Task SeedOpenSeaNfts()
    {
        var nftsResponse = await _openSeaClient.ListArtistNftsByChain(NftChain.Ethereum.ToString());
        var upsertedNfts = new List<NftArt>();

        foreach (var nft in nftsResponse.Nfts)
        {
            var domainNft = nft.ToDomain();

            var singleNftResponse = await _openSeaClient.GetNft(domainNft.NftChain.ToString(), domainNft.Address, nft.Identifier);

            if (!string.Equals(singleNftResponse.Nft.Creator, _openSeaConfig.CreatorAddress, StringComparison.InvariantCultureIgnoreCase))
            {
                continue;
            }

            domainNft.FillSingleNft(singleNftResponse.Nft);

            await HandleSingleNftRequest(singleNftResponse.Nft, domainNft.Edition);
        }
    }

    private async Task HandleSingleNftRequest(NftResponse nft, bool edition)
    {
        var nftOwners = nft.Owners?.Select(o => new Owner
        {
            Address = o.Address,
            Quantity = o.Quantity
        }).ToList();

        var nftId = (await _mediator.Send(new CreateOpenSeaNftRequest(
                Name: nft.Name,
                Description: nft.Description,
                ContractAddress: nft.Contract,
                Collection: nft.Collection,
                TokenId: nft.Identifier,
                OpenSeaUrl: nft.OpenseaUrl,
            NftUrl: nft.ImageUrl,
            Edition: edition,
            Owners: nftOwners
        ))).Id;

        if (nft.Owners is not null)
                {
            await _mediator.Send(new UpdateOwnersRequest(nftOwners, nftId));
        }

        await SeedOpenSeaNftEvents(nft.Contract, nft.Identifier, nft.Owners is null, nftOwners, nftId);

        if (nft.Owners is null)
        {
            await _mediator.Send(new UpdateOwnersRequest([], nftId));
        }
    }

    private async Task SeedOpenSeaNftEvents(string nftAddress, string nftIdentifier, bool calculateOwners, List<Owner>? owners, ObjectId nftId)
    {
        var nftEventsResponse = await _openSeaClient.GetNftEvents(nftAddress, nftIdentifier);

        await _mediator.Send(new CreateNftEventsRequest(nftEventsResponse.AssetEvents.Select(e =>
        {
            var (fromAddress, toAddress) = e.EventType == "sale"
                ? (e.Seller, e.Buyer)
                : (e.FromAddress, e.ToAddress);
            return new CreateNftEventRequest(
                TransactionId: e.Transaction,
                FromAddress: fromAddress,
                ToAddress: toAddress,
                EventTimestamp: e.EventTimestamp,
                EventType: e.EventType,
                NftChain: NftChain.Ethereum,
                NftIdentifier: e.NFT.Identifier,
                NftContract: e.NFT.Contract,
                Quantity: e.Quantity
            );
        }), CalculateOwners: calculateOwners));

        
    }

    private async Task SeedObjktNfts()
    {
        var nftsResponse = await _objktClient.GetArtistTokens();

        foreach (var nft in nftsResponse.Token)
        {
            await _mediator.Send(new CreateObjktNftRequest(
                Name: nft.Name,
                Description: nft.Description,
                ContractAddress: nft.FaContract,
                Collection: nft.Fa.Name,
                CollectionDescription: nft.Fa.Description,
                Timestamp: nft.Timestamp,
                TokenId: nft.TokenId,
                ObjktUrl: $"https://objkt.com/tokens/{nft.Fa.Path}/{nft.TokenId}",
                Edition: false
            ));
        }
    }
}