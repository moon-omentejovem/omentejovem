using AdminApi.Models;
using Domain.Models;
using MongoDB.Bson;
using MongoDB.Driver;

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

    public async Task<NftArtResponse> GetNft(ObjectId Id)
    {
        var nft = await _nftsCollection.Find(n => n.Id == Id).FirstOrDefaultAsync();

        var response = Mappers.MappingMethods.MapToResponse(nft);

        return response;
    }
}
