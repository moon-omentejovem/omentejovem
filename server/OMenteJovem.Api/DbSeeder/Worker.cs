using DbSeeder.Objkt;
using DbSeeder.Objkt.Mappers;
using Domain.Database;
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
using Microsoft.Extensions.Hosting;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Reflection;

namespace DbSeeder;

public class Worker : IHostedService
{
    private readonly ObjktClient _objktClient;
    private readonly OpenSeaConfig _openSeaConfig;
    private readonly OpenSeaClient _openSeaClient;
    private readonly IMongoCollection<NftArt> _nftsCollection;
    private readonly IMediator _mediator;

    public Worker(
        OpenSeaClient openSeaClient,
        ObjktClient objktClient,
        OpenSeaConfig openSeaConfig,
        IMediator mediator,
        IMongoDatabase database)
    {
        _openSeaClient = openSeaClient;
        _objktClient = objktClient;
        _mediator = mediator;
        _openSeaConfig = openSeaConfig;
        _nftsCollection = database.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);
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

            await HandleSingleNftRequest(singleNftResponse.Nft);
        }
    }

    private async Task SeedOpenSeaNfts()
    {
        var nftsResponse = await _openSeaClient.ListArtistNftsByChain(NftChain.Ethereum.ToString());

        foreach (var nft in nftsResponse.Nfts)
        {
            var domainNft = nft.ToDomain();

            var singleNftResponse = await _openSeaClient.GetNft(domainNft.NftChain.ToString(), domainNft.Address, nft.Identifier);

            if (!string.Equals(singleNftResponse.Nft.Creator, _openSeaConfig.CreatorAddress, StringComparison.InvariantCultureIgnoreCase))
            {
                continue;
            }

            await HandleSingleNftRequest(singleNftResponse.Nft);
        }
    }

    private async Task HandleSingleNftRequest(NftResponse nft)
    {
        await _mediator.Send(new CreateOpenSeaNftRequest(nft));
    }

    private async Task SeedOpenSeaNftEvents(string nftAddress, string nftIdentifier, bool calculateOwners)
    {
        var nftEventsResponse = await _openSeaClient.GetNftEvents(nftAddress, nftIdentifier);

        if (nftEventsResponse is null)
        {
            return;
        }

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

    private async Task SeedNftEvents()
    {
        var nfts = await _nftsCollection.Find(n => true).ToListAsync();

        foreach (var nft in nfts)
        {
            if (!nft.Address.StartsWith("0x"))
                continue;
            await SeedOpenSeaNftEvents(nft.Address, nft.SourceId, nft.Owners is null);

            await _mediator.Send(new UpdateOwnersRequest(nft.Id));
        }
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
                Edition: false,
                Owners : nft.Holders.Select(h => new CreateObktNftOwnerRequest(h.HolderAddress, h.Holder?.Alias, h.Quantity))
            ));
        }
    }

    private async Task RemoveDuplicates()
    {
        var allNfts = await _nftsCollection.Find(n => !n.Name.Contains("Untitled")).ToListAsync();

        var groupedByNameNfts = allNfts.GroupBy(n => n.Name, (nftName, allNfts) => new
        {
            Name = nftName,
            Nfts = allNfts
        });

        foreach (var groupPair in groupedByNameNfts)
        {
            if (groupPair.Nfts.Count() == 1)
                continue;

            var bestNft = GetObjectWithMostFilledProperties([.. groupPair.Nfts]);

            var nftsToDelete = groupPair.Nfts.Where(n => n.Id != bestNft.Id);

            await Task.WhenAll(nftsToDelete.Select(n => DeleteNft(n.Id)));
        }
    }

    private static NftArt GetObjectWithMostFilledProperties(params NftArt[] objects)
    {
        if (objects == null || objects.Length == 0)
            return default!;

        NftArt objectWithMostFilledProperties = default!;
        int maxNonNullCount = -1;

        foreach (var obj in objects)
        {
            if (obj == null)
                continue;

            int nonNullCount = CountNonNullProperties(obj);
            if (nonNullCount > maxNonNullCount)
            {
                maxNonNullCount = nonNullCount;
                objectWithMostFilledProperties = obj;
            }
        }

        return objectWithMostFilledProperties;
    }

    private static int CountNonNullProperties(NftArt obj)
    {
        var properties = typeof(NftArt).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        return properties.Count(prop => prop.GetValue(obj) != null) + obj.Owners.Count;
    }

    private async Task DeleteNft(ObjectId nftId)
    {
        await _nftsCollection.DeleteOneAsync(n => n.Id == nftId);
    }

    private async Task FillSourceIds()
    {
        var nfts = await _nftsCollection.Find(n => n.NftChain == NftChain.Ethereum && n.SourceId == null).ToListAsync();

        var nftsByCollection = nfts.GroupBy(n => n.Collection, (baseNft, allNfts) => new
        {
            Collection = baseNft,
            Nfts = allNfts
        });

        foreach (var nftCollection in nftsByCollection)
        {
            var openSeaNfts = await _openSeaClient.ListNftsByCollection(nftCollection.Collection, 15000);

            foreach (var nft in nftCollection.Nfts)
            {
                var existingNft = openSeaNfts.Nfts.FirstOrDefault(n => n.Name == nft.Name);

                if (existingNft is null)
                {
                    continue;
                }

                await _nftsCollection.UpdateOneAsync(n => n.Id == nft.Id, Builders<NftArt>.Update.Set(n => n.SourceId, existingNft.Identifier));
            }
        }
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await SeedOpenSeaCollections();

        await SeedOpenSeaNfts();

        await SeedObjktNfts();

        await SeedNftEvents();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
