using Newtonsoft.Json;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record HoldersResponse
{
    [JsonProperty("holder_address")]
    public string HolderAddress { get; init; }

    [JsonProperty("quantity")]
    public int Quantity { get; init; }

    [JsonProperty("holder")]
    public HolderResponse Holder { get; init; }
}