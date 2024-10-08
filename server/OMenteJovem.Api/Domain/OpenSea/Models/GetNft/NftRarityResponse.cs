using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetNft;

public record NftRarityResponse
{
    [JsonProperty("strategy_version")]
    public string? StrategyVersion { get; init; }

    [JsonProperty("rank")]
    public int? Rank { get; init; }

    [JsonProperty("score")]
    public int? Score { get; init; }

    [JsonProperty("calculated_at")]
    public string? CalculatedAt { get; init; }

    [JsonProperty("max_rank")]
    public int? MaxRank { get; init; }

    [JsonProperty("total_supply")]
    public int? TotalSupply { get; init; }

    [JsonProperty("ranking_features")]
    public Dictionary<string, int>? RankingFeatures { get; init; }
}
