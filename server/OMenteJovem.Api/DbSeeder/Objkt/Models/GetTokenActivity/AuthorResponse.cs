using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetTokenActivity;

public record AuthorResponse
{
    [JsonPropertyName("address")]
    public string Address { get; init; } = string.Empty;

    [JsonPropertyName("alias")]
    public string Alias { get; init; } = string.Empty;

    [JsonPropertyName("tzdomain")]
    public string TzDOmain {  get; init; } = string.Empty;

    [JsonPropertyName("logo")]
    public string Logo {  get; init; } = string.Empty;
}
