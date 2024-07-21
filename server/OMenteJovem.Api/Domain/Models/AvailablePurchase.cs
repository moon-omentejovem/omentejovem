using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Models;

[BsonIgnoreExtraElements]
public class AvailablePurchase 
{
    public bool Active { get; set; } = true;
    public string Text { get; set; }
    public string Url { get; set; }
}
