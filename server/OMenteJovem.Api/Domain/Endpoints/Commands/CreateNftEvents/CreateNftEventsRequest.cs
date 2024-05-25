using Domain.Database;
using Domain.Models;
using Domain.Utils;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateNftEvents;

public record CreateNftEventsRequest(
    IEnumerable<CreateNftEventRequest> Events
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
        var mintDate = NftConstants.ParsePosixTimestamp(mintEvent.EventTimestamp);

        var lastEvent = request.Events.OrderByDescending(e => e.EventTimestamp).FirstOrDefault();

        if (existingNft.Edition)
        {
            var (totalNfts, availableNfts) = CalculateAvailableTokens(mintEvent, request.Events);

            await _nftsCollection.UpdateOneAsync(n => n.Id == existingNft.Id, Builders<NftArt>.Update
                .Set(n => n.MintedDate, mintDate)
                .Set(n => n.TotalTokens, totalNfts)
                .Set(n => n.AvailableTokens, availableNfts)
                .Set(n => n.MintedEvent, ToDomain(mintEvent))
                .Set(n => n.LastTransferEvent, ToDomain(lastEvent)), cancellationToken: cancellationToken);
        }
        else
        {
            await _nftsCollection.UpdateOneAsync(n => n.Id == existingNft.Id, Builders<NftArt>.Update
                .Set(n => n.MintedDate, mintDate), cancellationToken: cancellationToken);
        }

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

        return (totalNfts, availableNfts);
    }

    private static CreateNftEventRequest FindMintEvent(IEnumerable<CreateNftEventRequest> events)
    {
        var mintEvent = events.First(e => e.EventType == "transfer" && e.FromAddress == NftConstants.NullAddress);

        return mintEvent;
    }
}