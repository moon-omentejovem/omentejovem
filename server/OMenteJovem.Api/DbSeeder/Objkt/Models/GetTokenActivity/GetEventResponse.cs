using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetTokenActivity;

public record GetEventResponse
{
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; init; }

    [JsonPropertyName("token_pk")]
    public int TokenPk { get; init; }

    [JsonPropertyName("fa_contract")]
    public string FaContract { get; init; } = string.Empty;

    [JsonPropertyName("ophash")]
    public string OpHash { get; init; } = string.Empty;

    [JsonPropertyName("level")]
    public string Level {  get; init; } = string.Empty;

    [JsonPropertyName("creator")]
    public AuthorResponse? Creator { get; init; }

    [JsonPropertyName("recipient")]
    public AuthorResponse? Recipient { get; init; }
}
