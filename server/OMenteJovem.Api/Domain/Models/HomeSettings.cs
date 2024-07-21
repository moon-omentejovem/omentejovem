using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Models;

[BsonIgnoreExtraElements]
public class HomeSettings
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public ObjectId[] NftIds { get; set; } = [];
}
