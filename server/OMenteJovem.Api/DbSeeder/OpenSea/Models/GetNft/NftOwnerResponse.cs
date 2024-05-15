using Newtonsoft.Json;

namespace DbSeeder.OpenSea.Models.GetNft;

public record NftOwnerResponse
{
    [JsonProperty("address")]
    public string Address { get; init; }

    [JsonProperty("quantity")]
    public int Quantity { get; init; }
}
