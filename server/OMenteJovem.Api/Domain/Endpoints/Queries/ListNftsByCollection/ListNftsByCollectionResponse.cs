using Domain.Endpoints.Models;

namespace Domain.Endpoints.Queries.ListNftsByCollection;

public record ListNftsByCollectionResponse
(
    IEnumerable<NftArtResponse> Nfts
);
