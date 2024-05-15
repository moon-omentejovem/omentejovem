using MongoDB.Bson;

namespace Domain.Models;

public class NftArt
{
    public ObjectId Id { get; set; }
    public string SourceId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public AvailablePurchase AvailablePurchase { get; set; }
    public string Address { get; set; }
    public DateTime MintedDate { get; set; }
    public List<Owner> Owners { get; set; }
    public string? Url { get; set; }
    public List<Contract> Contracts { get; set; }
    public string? NftUrl { get; set; }
    public MakeOffer? MakeOffer { get; set; }
    public string? VideoProcess { get; set; }
    public NftChain NftChain { get; set; } = NftChain.Unknown;
    public bool Etherscan { get; set; } = false;
    public string? Collection { get; set; }
    public bool OneOfOne { get; set; }
    public bool Edition { get; set; }
    public ExternalLinks ExternalLinks { get; set; }
}
