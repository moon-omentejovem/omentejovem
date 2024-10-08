using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record TokenResponse
{
    [JsonProperty("pk")]
    public int Pk { get; init; }

    [JsonProperty("token_id")]
    public string TokenId { get; init; } = string.Empty;

    [JsonProperty("fa_contract")]
    public string FaContract { get; init; } = string.Empty;

    [JsonProperty("artifact_uri")]
    public string ArtifactUri { get; init; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; init; } = string.Empty;

    [JsonProperty("display_uri")]
    public string DisplayUri { get; init; } = string.Empty;

    [JsonProperty("supply")]
    public string Supply { get; init; } = string.Empty;

    [JsonProperty("name")]
    public string Name { get; init; } = string.Empty;

    [JsonProperty("mime")]
    public string Mime { get; init; } = string.Empty;

    [JsonProperty("metadata")]
    public string Metadata { get; init; } = string.Empty;

    [JsonProperty("timestamp")]
    public string Timestamp { get; init; } = string.Empty;

    [JsonProperty("fa")]
    public FaResponse Fa { get; init; }

    [JsonProperty("holders")]
    public List<HoldersResponse> Holders { get; init; } = [];
}