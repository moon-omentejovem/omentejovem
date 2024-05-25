namespace Domain.Database;

public class MongoDbConfig
{
    public string ConnectionString { get; set; }
    public string DatabaseName { get; set; }

    public static readonly string NftArtsCollectionName = "nftArts";
    public static readonly string CollectionsCollectionName = "collections";
    public static readonly string NftEventsCollectionName = "nftEvents";
}