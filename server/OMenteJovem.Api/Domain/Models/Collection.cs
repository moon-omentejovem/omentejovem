using MongoDB.Bson;

namespace Domain.Models;

public class Collection
{
    public ObjectId Id { get; set; }
    public string ContractAddress { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string SourceId { get; set; }
    public string Year { get; set; }
    public NftChain NftChain { get; set; }
    public List<string> BackgroundUrls { get; set; }
    public List<string> NftIds { get; set; }
    public bool Edition { get; set; }
}