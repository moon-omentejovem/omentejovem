using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Models;

[BsonIgnoreExtraElements]
public class HomeSettings
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public HomeNft[] NftIds { get; set; } = [];
}

public class HomeNft
{
    public ObjectId Id { get; set; }
    public string Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string Url { get; set; } = string.Empty;
}
