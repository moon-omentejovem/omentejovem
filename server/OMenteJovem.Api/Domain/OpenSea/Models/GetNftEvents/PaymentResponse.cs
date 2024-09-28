using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetNftEvents;

public record PaymentResponse
{
    [JsonProperty("quantity")]
    public string Quantity { get; init; }

    [JsonProperty("token_address")]
    public string TokenAddress { get; init; }

    [JsonProperty("decimals")]
    public int Decimals { get; init; }

    [JsonProperty("symbol")]
    public string Symbol { get; init; }
}