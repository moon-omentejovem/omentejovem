namespace Domain.OpenSea.Models.GetCollections;

public record GetCollectionsResponse
(
    List<CollectionResponse> Collections
);