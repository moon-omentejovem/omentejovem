using Newtonsoft.Json;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record FaResponse
{
    [JsonProperty("name")]
    public string Name { get; init; } = string.Empty;

    [JsonProperty("path")]
    public string Path { get; init; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; init; } = string.Empty;
}