using Newtonsoft.Json;

namespace DbSeeder.OpenSea.Models.GetNft;

public record NftResponse
{
    [JsonProperty("identifier")]
    public string Identifier { get; init; }

    [JsonProperty("collection")]
    public string Collection { get; init; }

    [JsonProperty("contract")]
    public string Contract { get; init; }

    [JsonProperty("token_standard")]
    public string TokenStandard { get; init; }

    [JsonProperty("name")]
    public string Name { get; init; }

    [JsonProperty("description")]
    public string Description { get; init; }

    [JsonProperty("image_url")]
    public string ImageUrl { get; init; }

    [JsonProperty("metadata_url")]
    public string MetadataUrl { get; init; }

    [JsonProperty("opensea_url")]
    public string OpenseaUrl { get; init; }

    [JsonProperty("updated_at")]
    public string UpdatedAt { get; init; }

    [JsonProperty("is_disabled")]
    public bool IsDisabled { get; init; }

    [JsonProperty("is_nsfw")]
    public bool IsNsfw { get; init; }

    [JsonProperty("animation_url")]
    public string AnimationUrl { get; init; }

    [JsonProperty("is_suspicious")]
    public bool IsSuspicious { get; init; }

    [JsonProperty("creator")]
    public string Creator { get; init; }

    [JsonProperty("traits")]
    public List<NftTraitResponse> Traits { get; init; }

    [JsonProperty("owners")]
    public List<NftOwnerResponse>? Owners { get; init; }

    [JsonProperty("rarity")]
    public NftRarityResponse Rarity { get; init; }
}