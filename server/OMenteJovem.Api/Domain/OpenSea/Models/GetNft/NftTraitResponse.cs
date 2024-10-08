using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetNft;

public record NftTraitResponse
{
    [JsonProperty("trait_type")]
    public string TraitType { get; init; }

    [JsonProperty("display_type")]
    public string DisplayType { get; init; }

    [JsonProperty("max_value")]
    public string MaxValue { get; init; }

    [JsonProperty("value")]
    public string Value { get; init; }
}
