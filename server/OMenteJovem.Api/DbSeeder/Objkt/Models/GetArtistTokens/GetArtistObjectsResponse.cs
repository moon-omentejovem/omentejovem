using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record GetArtistObjectsResponse
{
    [JsonPropertyName("token")]
    public List<TokenResponse> Token { get; init; }
}
