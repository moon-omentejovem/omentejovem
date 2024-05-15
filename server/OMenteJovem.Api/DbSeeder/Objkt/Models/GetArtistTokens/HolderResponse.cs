using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record HolderResponse
{
    [JsonPropertyName("address")]
    public string Address { get; init; }

    [JsonPropertyName("alias")]
    public string? Alias { get; init; }

    [JsonPropertyName("tzdomain")]
    public string? TzDomain { get; init; }

    [JsonPropertyName("logo")]
    public string? Logo { get; init; }
}
