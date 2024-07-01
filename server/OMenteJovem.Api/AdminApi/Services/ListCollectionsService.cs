using AdminApi.Mappers;
using AdminApi.Models;
using Domain.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq.Expressions;

namespace AdminApi.Services;

public class ListCollectionsService(IMongoDatabase mongoDatabase)
{
    private readonly IMongoCollection<Collection> _collections = mongoDatabase.GetCollection<Collection>("collections");

    public async Task<IEnumerable<CollectionResponse>> ListCollections()
    {
        var allCollections = await _collections.Find(_ => true).ToListAsync();

        var responses = allCollections.Select(Mappers.MappingMethods.MapToResponse);

        return responses;
    }

    public async Task<CollectionResponse> GetCollection(ObjectId id)
    {
        var collection = await _collections.Find(c => c.Id == id).FirstOrDefaultAsync();

        return MappingMethods.MapToResponse(collection);
    }

    public async Task UpdateCollection(UpdateCollectionBuilder updateBuilder)
    {
        await _collections.UpdateOneAsync(updateBuilder.IdFilter, updateBuilder.Update);
    }
}

public class UpdateCollectionBuilder(ObjectId Id)
{
    public readonly FilterDefinition<Collection> IdFilter = new ExpressionFilterDefinition<Collection>((Collection art) => art.Id == Id);
    public UpdateDefinition<Collection>? Update = null;

    public UpdateCollectionBuilder Set<TField>(Expression<Func<Collection, TField>> expressionField, TField value)
    {
        if (Update is null)
        {
            Update = Builders<Collection>.Update.Set(expressionField, value);
        }
        else
        {
            Update = Update.Set(expressionField, value);
        }

        return this;
    }
}
