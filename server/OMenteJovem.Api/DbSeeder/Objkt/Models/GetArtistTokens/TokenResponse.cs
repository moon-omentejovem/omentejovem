using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace DbSeeder.Objkt.Models.GetArtistTokens;

public record TokenResponse
{
    [JsonProperty("pk")]
    public int Pk { get; init; }

    [JsonProperty("token_id")]
    public string TokenId { get; init; }

    [JsonProperty("fa_contract")]
    public string FaContract { get; init; }

    [JsonProperty("artifact_uri")]
    public string ArtifactUri { get; init; }

    [JsonProperty("description")]
    public string Description { get; init; }

    [JsonProperty("display_uri")]
    public string DisplayUri { get; init; }

    [JsonProperty("supply")]
    public string Supply { get; init; }

    [JsonProperty("name")]
    public string Name { get; init; }

    [JsonProperty("mime")]
    public string Mime { get; init; }

    [JsonProperty("metadata")]
    public string Metadata { get; init; }

    [JsonProperty("timestamp")]
    public string Timestamp { get; init; }

    [JsonProperty("fa")]
    public FaResponse Fa { get; init; }

    [JsonProperty("holders")]
    public List<HoldersResponse> Holders { get; init; }
}