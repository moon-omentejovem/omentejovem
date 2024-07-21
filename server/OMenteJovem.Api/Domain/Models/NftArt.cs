using Domain.Models.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Models;

[BsonIgnoreExtraElements]
public class NftArt
{
    public ObjectId Id { get; set; }
    public string SourceId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public AvailablePurchase AvailablePurchase { get; set; } = new();
    public string Address { get; set; }
    public DateTime? MintedDate { get; set; }
    public List<Owner> Owners { get; set; } = [];
    public string? Url { get; set; }
    public List<Contract> Contracts { get; set; } = [];
    public string? NftUrl { get; set; }
    public OptimizedImages OptimizedImages { get; set; }
    public MakeOffer? MakeOffer { get; set; } = new();
    public string? VideoProcess { get; set; }
    public NftChain NftChain { get; set; } = NftChain.Unknown;
    public bool Etherscan { get; set; } = false;
    public string? Collection { get; set; }
    public bool OneOfOne { get; set; }
    public bool Edition { get; set; }
    public int? TotalTokens { get; set; }
    public int? AvailableTokens { get; set; }
    public ExternalLinks ExternalLinks { get; set; } = new();
    public NftTransferEvent? MintedEvent { get; set; }
    public NftTransferEvent? LastTransferEvent { get; set; }
}

public class OptimizedImages
{
    public string OriginalCompression { get; set; } = string.Empty;
    public List<ResizedImage> ResizedImages { get; set; } = [];
}

public class ResizedImage
{
    public int Height { get; set; }
    public string Source { get; set; }
}
