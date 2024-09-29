using Domain.Database;
using Domain.Models;
using Domain.OpenSea;
using MediatR;
using MongoDB.Bson;
using MongoDB.Driver;
using Owner = Domain.Models.Owner;

namespace Domain.Endpoints.Commands.UpdateOwners;

public record UpdateOwnersRequest
(
    List<Owner>? OwnersRequest,
    ObjectId NftId
) : IRequest;

public class UpdateOwnersRequestHandler(IMongoDatabase mongoDatabase, OpenSeaClient openSeaClient) : IRequestHandler<UpdateOwnersRequest>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task Handle(UpdateOwnersRequest request, CancellationToken cancellationToken)
    {
        var nftOwners = request.OwnersRequest
            ?? (await _nftsCollection.Find(n => n.Id == request.NftId).FirstAsync(cancellationToken)).Owners;

        foreach (var owner in nftOwners)
        {
            if (!string.IsNullOrEmpty(owner.Alias))
                continue;

            var accountResponse = await openSeaClient.GetAccount(owner.Address);

            if (accountResponse != null) 
            {
                owner.Alias = accountResponse.Username;
            }
        }

        await _nftsCollection.UpdateOneAsync(n => n.Id == request.NftId, Builders<NftArt>.Update.Set(n => n.Owners, nftOwners));
    }
}