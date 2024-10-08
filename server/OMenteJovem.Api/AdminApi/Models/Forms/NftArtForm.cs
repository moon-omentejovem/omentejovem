using Domain.Models;
using Domain.Models.Enums;
using MongoDB.Bson;

namespace AdminApi.Models.Forms;

public class NftArtForm
{
    public ObjectId Id { get; set; }
    public string SourceId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string Address { get; set; }
    public DateTime? MintedDate { get; set; }
    public string? Url { get; set; }
    public string? NftUrl { get; set; }
    public string? VideoProcess { get; set; }
    public NftChain NftChain { get; set; } = NftChain.Unknown;
    public string? Collection { get; set; }
    public bool OneOfOne { get; set; }
    public bool Edition { get; set; }
    public OptimizedImages OptimizedImages { get; set; }
    public AvailablePurchase? AvailablePurchase { get; set; }
    public List<Owner> Owners { get; set; } = [];
    public NftTransferEvent? MintedEvent { get; set; }
}
