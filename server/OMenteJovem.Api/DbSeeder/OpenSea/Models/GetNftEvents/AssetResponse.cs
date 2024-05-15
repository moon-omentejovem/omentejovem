namespace DbSeeder.OpenSea.Models.GetNftEvents;

public record AssetResponse(
        string Identifier,
        string Collection,
        string Contract,
        string TokenStandard,
        string Name,
        string Description,
        string ImageUrl,
        string MetadataUrl,
        string OpenseaUrl,
        string UpdatedAt,
        bool IsDisabled,
        bool IsNsfw
    );