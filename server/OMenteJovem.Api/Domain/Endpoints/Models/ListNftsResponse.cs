namespace Domain.Endpoints.Models;

public record ListNftsResponse
(
    IEnumerable<NftArtResponse> Nfts
);
