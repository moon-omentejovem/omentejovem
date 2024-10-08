using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetCollections;

public record CollectionResponse
{
    [JsonProperty("collection")]
    public string Collection { get; init; }

    [JsonProperty("name")]
    public string Name { get; init; }

    [JsonProperty("description")]
    public string Description { get; init; }

    [JsonProperty("image_url")]
    public string ImageUrl { get; init; }

    [JsonProperty("banner_image_url")]
    public string BannerImageUrl { get; init; }

    [JsonProperty("owner")]
    public string Owner { get; init; }

    [JsonProperty("category")]
    public string Category { get; init; }

    [JsonProperty("is_disabled")]
    public bool IsDisabled { get; init; }

    [JsonProperty("is_nsfw")]
    public bool IsNsfw { get; init; }

    [JsonProperty("trait_offers_enabled")]
    public bool TraitOffersEnabled { get; init; }

    [JsonProperty("collection_offers_enabled")]
    public bool CollectionOffersEnabled { get; init; }

    [JsonProperty("opensea_url")]
    public string OpenseaUrl { get; init; }

    [JsonProperty("project_url")]
    public string ProjectUrl { get; init; }

    [JsonProperty("wiki_url")]
    public string WikiUrl { get; init; }

    [JsonProperty("discord_url")]
    public string DiscordUrl { get; init; }

    [JsonProperty("telegram_url")]
    public string TelegramUrl { get; init; }

    [JsonProperty("twitter_username")]
    public string TwitterUsername { get; init; }

    [JsonProperty("instagram_username")]
    public string InstagramUsername { get; init; }

    [JsonProperty("contracts")]
    public List<ContractResponse> Contracts { get; init; }
}
