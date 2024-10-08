using Domain.Models.Enums;
using MongoDB.Bson;

namespace AdminApi.Models;

public class NftArtResponse
{
    public ObjectId Id { get; set; }
    public string SourceId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public AvailablePurchaseResponse? AvailablePurchase { get; set; }
    public string Address { get; set; }
    public DateTime? MintedDate { get; set; }
    public List<OwnerResponse>? Owners { get; set; }
    public string? Url { get; set; }
    public List<ContractResponse>? Contracts { get; set; }
    public string? NftUrl { get; set; }
    public MakeOfferResponse? MakeOffer { get; set; }
    public string? VideoProcess { get; set; }
    public NftChain NftChain { get; set; } = NftChain.Unknown;
    public bool Etherscan { get; set; } = false;
    public string? Collection { get; set; }
    public bool OneOfOne { get; set; }
    public bool Edition { get; set; }
    public ExternalLinksResponse ExternalLinks { get; set; } = new([]);
    public string? LowestCompressionUrl;
    public string CompactDescription
    {
        get {
            if (string.IsNullOrEmpty(Description))
            {
                return string.Empty;
            }
            if (Description.Length <= 150)
            {
                return Description;
            }

            return $"{Description.Substring(0, 150)}...";
        }
    }
    
    public bool IsReady()
    {
        return
            !string.IsNullOrWhiteSpace(Name) &&
            !string.IsNullOrWhiteSpace(Description) &&
            !string.IsNullOrWhiteSpace(Address) &&
            !ExternalLinks.ExternalLinks.Any();
    }
}
