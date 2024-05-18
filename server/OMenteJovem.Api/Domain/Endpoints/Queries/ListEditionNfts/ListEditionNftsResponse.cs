using Domain.Endpoints.Models;

namespace Domain.Endpoints.Queries.ListEditionNfts;

public record ListEditionNftsResponse(
    IEnumerable<NftArtResponse> Nfts
);
