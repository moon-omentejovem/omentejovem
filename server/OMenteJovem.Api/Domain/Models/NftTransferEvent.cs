using MongoDB.Bson;

namespace Domain.Models;

public record NftTransferEvent
{
    public ObjectId Id { get; set; }
    public string Transaction { get; set; }
    public string FromAddress { get; set; }
    public string ToAddress { get; set; }
    public long EventTimestamp { get; set; }
    public string EventType { get; set; } = "transfer";
    public NftChain NftChain { get; set; } = NftChain.Ethereum;
    public string NftIdentifier { get; set; }
    public ObjectId NftId { get; set; }
    public int Quantity { get; set; }
}
