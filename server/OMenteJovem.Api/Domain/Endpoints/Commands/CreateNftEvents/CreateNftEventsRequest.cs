using Domain.Database;
using Domain.Models;
using Domain.Models.Enums;
using Domain.Utils;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateNftEvents;

public record CreateNftEventsRequest(
    IEnumerable<CreateNftEventRequest> Events,
    bool CalculateOwners
) : IRequest;

public record CreateNftEventRequest(
    string TransactionId,
    string FromAddress,
    string ToAddress,
    long EventTimestamp,
    string EventType,
    NftChain NftChain,
    string NftIdentifier,
    string NftContract,
    int Quantity
);

public class CreateNftEventsRequestHandler(IMongoDatabase mongoDatabase) : IRequestHandler<CreateNftEventsRequest>
{
    private readonly IMongoCollection<NftTransferEvent> _nftEventsCollection = mongoDatabase.GetCollection<NftTransferEvent>(MongoDbConfig.NftEventsCollectionName);
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task Handle(CreateNftEventsRequest request, CancellationToken cancellationToken)
    {
        var nftReference = request.Events.FirstOrDefault();

        if (nftReference is null)
            return;

        var (nftIdentifier, nftContract) = (nftReference.NftIdentifier, nftReference.NftContract.ToLower());

        var existingNft = await _nftsCollection.Find(n =>
            n.Contracts.Any(c => c.ContractAddress == nftContract && c.SourceId == nftIdentifier)
        ).FirstOrDefaultAsync(cancellationToken);

        if (existingNft is null)
        {
            Console.WriteLine($"Nft not found with contract {nftContract} and identifier {nftIdentifier}");
            return;
        }

        var mintEvent = FindMintEvent(request.Events);
        var mintDate = NftConstants.ParsePosixTimestamp(mintEvent?.EventTimestamp);

        var lastEvent = request.Events.OrderByDescending(e => e.EventTimestamp).FirstOrDefault();

        existingNft.MintedDate = mintDate;
        existingNft.MintedEvent = ToDomain(mintEvent);
        existingNft.LastTransferEvent = ToDomain(lastEvent);

        var updateBuilder = Builders<NftArt>.Update
                .Set(n => n.MintedDate, mintDate)
                .Set(n => n.MintedEvent, ToDomain(mintEvent))
                .Set(n => n.LastTransferEvent, ToDomain(lastEvent));

        if (existingNft.CreatedAt is null && mintEvent is not null)
        {
            existingNft.CreatedAt = NftConstants.ParsePosixTimestamp(mintEvent.EventTimestamp);
        }

        if (existingNft.Edition && mintEvent is not null)
        {
            var (totalNfts, availableNfts) = CalculateAvailableTokens(mintEvent, request.Events);

            existingNft.TotalTokens = totalNfts;
            existingNft.AvailableTokens = availableNfts;

            if (request.CalculateOwners)
            {
                var owners = GetOwnersFromTransactions(request.Events);

                existingNft.Owners = owners;
            }
        }

        var updateString = updateBuilder.ToString();

        var result = await _nftsCollection.ReplaceOneAsync(n => n.Id == existingNft.Id, existingNft, new ReplaceOptions { IsUpsert = true }, cancellationToken: cancellationToken);
        if (result.ModifiedCount == 0)
            throw new Exception();

        foreach (var nftEvent in request.Events)
        {
            await _nftEventsCollection.UpdateOneAsync(e => e.Transaction == nftEvent.TransactionId, Builders<NftTransferEvent>.Update
                .Set(e => e.Transaction, nftEvent.TransactionId)
                .Set(e => e.FromAddress, nftEvent.FromAddress)
                .Set(e => e.ToAddress, nftEvent.ToAddress)
                .Set(e => e.EventTimestamp, nftEvent.EventTimestamp)
                .Set(e => e.EventType, nftEvent.EventType)
                .Set(e => e.NftIdentifier, nftEvent.NftIdentifier)
                .Set(e => e.NftId, existingNft.Id)
                .Set(e => e.Quantity, nftEvent.Quantity)

            , new UpdateOptions { IsUpsert = true }, cancellationToken: cancellationToken);
        }
    }

    private static List<Owner> GetOwnersFromTransactions(IEnumerable<CreateNftEventRequest> events)
    {
        var transferEvents = events.Where(e => e.EventType == "transfer");

        var allFrom = transferEvents.Select(e => e.FromAddress).ToList();
        var allTo = transferEvents.Select(e => e.ToAddress).ToList();

        IEnumerable<string> allInvolved = [..allFrom, ..allTo];

        allInvolved = allInvolved.Distinct();

        List<Owner> allOwners = [];

        foreach (var involved in allInvolved)
        {
            var parsedEvents = transferEvents
                .Where(e => e.FromAddress == involved || e.ToAddress == involved)
                .Select(e => new
                {
                    Quantity = e.FromAddress == involved ? e.Quantity * -1 : e.Quantity
                });

            allOwners.Add(new Owner
            {
                Address = involved,
                Quantity = parsedEvents.Sum(e => e.Quantity)
            });
        }

        var currentOwners = allOwners.Where(o => o.Quantity > 0);

        return currentOwners.ToList();
    }

    private static NftTransferEvent? ToDomain(CreateNftEventRequest? request)
    {
        if (request == null)
            return null;

        return new NftTransferEvent
        {
            Transaction = request.TransactionId,
            FromAddress = request.FromAddress,
            ToAddress = request.ToAddress,
            EventTimestamp = request.EventTimestamp,
            EventType = request.EventType,
            NftIdentifier = request.NftIdentifier,
            Quantity = request.Quantity
        };
    }

    private static (int totalNfts, int availableNfts) CalculateAvailableTokens(CreateNftEventRequest mintEvent, IEnumerable<CreateNftEventRequest> events)
    {
        int totalNfts = mintEvent.Quantity;

        var burnedTokens = events.Where(e =>
            e.FromAddress == mintEvent.ToAddress &&
            e.EventType == "transfer" &&
            e.ToAddress == NftConstants.NullAddress
        );
        int totalBurned = burnedTokens.Sum(t => t.Quantity);

        totalNfts -= totalBurned;

        var soldByCreator = events.Where(e =>
            e.FromAddress == mintEvent.ToAddress &&
            e.EventType == "transfer" &&
            e.ToAddress != NftConstants.NullAddress
        );

        int sumSoldByCreator = soldByCreator.Sum(t => t.Quantity);

        var returnedToCreator = events.Where(e =>
            e.ToAddress == mintEvent.ToAddress &&
            e.EventType == "transfer" &&
            e.FromAddress != NftConstants.NullAddress
        );

        int sumReturnedToCreator = returnedToCreator.Sum(e => e.Quantity);

        int availableNfts = totalNfts - sumSoldByCreator + sumReturnedToCreator;

        if (availableNfts < 0)
        {
            availableNfts = 0;
        }

        return (totalNfts, availableNfts);
    }

    private static CreateNftEventRequest? FindMintEvent(IEnumerable<CreateNftEventRequest> events)
    {
        var mintEvent = events.FirstOrDefault(e => e.EventType == "transfer" && e.FromAddress == NftConstants.NullAddress);

        return mintEvent;
    }
}