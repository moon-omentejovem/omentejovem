namespace Domain.Database;

public class MongoDbConfig
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;

    public static readonly string NftArtsCollectionName = "nftArts";
    public static readonly string CollectionsCollectionName = "collections";
    public static readonly string NftEventsCollectionName = "nftEvents";
    public static readonly string HomeSettingsCollectionName = "homeSettings";
}