using Domain.Database;
using Domain.Models;
using Domain.Models.Enums;
using MediatR;
using MongoDB.Driver;

namespace Domain.Endpoints.Commands.CreateCollection;

public record CreateCollectionRequest
(
    string Address,
    string Name,
    string SourceId,
    string Description,
    string Year,
    NftChain NftChain
) : IRequest;

public class CreateCollectionRequestHandler(IMongoDatabase mongoDatabase) : IRequestHandler<CreateCollectionRequest>
{
    private readonly IMongoCollection<Collection> _collections = mongoDatabase.GetCollection<Collection>(MongoDbConfig.CollectionsCollectionName);

    public async Task Handle(CreateCollectionRequest request, CancellationToken cancellationToken)
    {
        var existingCollection = await _collections.Find(c => c.Name == request.Name).FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (existingCollection is null)
        {
            var newCollection = new Collection
            {
                Name = request.Name,
                Description = request.Description,
                SourceId = request.SourceId,
                Year = request.Year,
                ContractAddress = request.Address,
                NftChain = request.NftChain,
            };

            await _collections.InsertOneAsync(newCollection, cancellationToken: cancellationToken);
        }
    }
}