using Newtonsoft.Json;

namespace DbSeeder.OpenSea.Models.GetNftEvents;

public record NftEventResponse
{
    [JsonProperty("event_type")]
    public string EventType { get; init; }

    [JsonProperty("order_hash")]
    public string OrderHash { get; init; }

    [JsonProperty("maker")]
    public string Maker { get; init; }

    [JsonProperty("event_timestamp")]
    public long EventTimestamp { get; init; }

    [JsonProperty("nft")]
    public NFTResponse NFT { get; init; }

    [JsonProperty("asset")]
    public NFTResponse Asset { get; init; }

    [JsonProperty("order_type")]
    public object OrderType { get; init; }

    [JsonProperty("protocol_address")]
    public string ProtocolAddress { get; init; }

    [JsonProperty("start_date")]
    public long StartDate { get; init; }

    [JsonProperty("expiration_date")]
    public long ExpirationDate { get; init; }

    [JsonProperty("quantity")]
    public int Quantity { get; init; }

    [JsonProperty("taker")]
    public string Taker { get; init; }

    [JsonProperty("payment")]
    public PaymentResponse Payment { get; init; }

    [JsonProperty("criteria")]
    public CriteriaResponse Criteria { get; init; }

    [JsonProperty("is_private_listing")]
    public bool IsPrivateListing { get; init; }

    [JsonProperty("closing_date")]
    public long ClosingDate { get; init; }

    [JsonProperty("seller")]
    public string Seller { get; init; }

    [JsonProperty("buyer")]
    public string Buyer { get; init; }

    [JsonProperty("transaction")]
    public string Transaction { get; init; }

    [JsonProperty("from_address")]
    public string FromAddress { get; init; }

    [JsonProperty("to_address")]
    public string ToAddress { get; init; }
}