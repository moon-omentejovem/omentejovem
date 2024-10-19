namespace Domain.OpenSea.Models.ListNfts;

public record ListNftsResponse 
{
    public ListNftsResponse(List<ListNftResponse> nfts, string? next)
    {
        Nfts = nfts;
        Next = next;
    }

    public List<ListNftResponse> Nfts { get; init; } = [];
    public string? Next { get; init; }
}