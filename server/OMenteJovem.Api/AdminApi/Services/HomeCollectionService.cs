using Domain.Database;
using Domain.Models;
using MongoDB.Driver;

namespace AdminApi.Services;

public class HomeCollectionService(IMongoDatabase mongoDatabase)
{
    private readonly IMongoCollection<HomeSettings> _homeSettingsCollection = mongoDatabase.GetCollection<HomeSettings>(MongoDbConfig.HomeSettingsCollectionName);

    public async Task<HomeSettings?> GetHomeSettings()
    {
        var homeSettings = await _homeSettingsCollection.Find(_ => true).FirstOrDefaultAsync();

        return homeSettings;
    }

    public async Task UpsertHomeSettings(HomeSettings homeSettings)
    {
        await _homeSettingsCollection.UpdateOneAsync(_ => true, Builders<HomeSettings>.Update
            .Set(h => h.Title, homeSettings.Title)
            .Set(h => h.Subtitle, homeSettings.Subtitle)
            .Set(h => h.NftIds, homeSettings.NftIds)
        , new UpdateOptions
        {
            IsUpsert = true
        });
    }
}
