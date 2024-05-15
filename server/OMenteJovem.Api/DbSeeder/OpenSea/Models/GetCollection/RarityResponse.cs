namespace DbSeeder.OpenSea.Models.GetCollection;

public record RarityResponse(
    string StrategyVersion,
    DateTime CalculatedAt,
    int MaxRank,
    int TotalSupply
);
