using Domain.Models;

namespace Domain.Endpoints.Models;

public record NftOwnerResponse(
    string Address,
    string? Alias,
    int? Quantity
)
{
    public static IEnumerable<NftOwnerResponse> FromDomain(NftArt nftArt)
    {
        return nftArt.Owners.Select(o => new NftOwnerResponse(Address: o.Address, Alias: o.Alias, Quantity: o.Quantity));
    }
}
