namespace Domain.OpenSea.Models.ListNfts;

public record ListNftsResponse(
    List<ListNftResponse> Nfts,
    string? Next
);