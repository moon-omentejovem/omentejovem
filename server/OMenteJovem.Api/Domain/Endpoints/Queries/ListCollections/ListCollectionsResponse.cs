namespace Domain.Endpoints.Queries.ListCollections;

public record ListCollectionsResponse(List<CollectionResponse> Collections);

public record CollectionResponse(
    string Name,
    string Year,
    string Slug,
    IEnumerable<string> NftImageUrls
);