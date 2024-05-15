using Newtonsoft.Json;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record FaResponse
{
    [JsonProperty("name")]
    public string Name { get; init; }

    [JsonProperty("path")]
    public string Path { get; init; }

    [JsonProperty("description")]
    public string Description { get; init; }


}