using AdminApi.Models;
using Domain.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq.Expressions;

namespace AdminApi.Services;

public class ListNftsService(IMongoDatabase mongoDatabase)
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>("nftArts");

    public async Task<IEnumerable<NftArtResponse>> ListNfts()
    {
        var allNfts = await _nftsCollection.Find(_ => true).ToListAsync();

        var responses = allNfts.Select(Mappers.MappingMethods.MapToResponse);

        return responses;
    }

    public async Task<NftArt> GetNft(ObjectId Id)
    {
        var nft = await _nftsCollection.Find(n => n.Id == Id).FirstOrDefaultAsync();

        return nft;
    }

    public async Task UpdateNft(UpdateNftBuilder updateBuilder)
    {
        await _nftsCollection.UpdateOneAsync(updateBuilder.IdFilter, updateBuilder.Update);
    }
}

public class UpdateNftBuilder(ObjectId Id)
{
    public readonly FilterDefinition<NftArt> IdFilter = new ExpressionFilterDefinition<NftArt>((NftArt art) => art.Id == Id);
    public UpdateDefinition<NftArt>? Update = null;

    public UpdateNftBuilder Set<TField>(Expression<Func<NftArt, TField>> expressionField, TField value)
    {
        if (Update is null)
        {
            Update = Builders<NftArt>.Update.Set(expressionField, value);
        }
        else
        {
            Update = Update.Set(expressionField, value);
        }

        return this;
    }
}
