using Domain.Models;

namespace Domain.Endpoints.Models;

public record NftOwnerResponse(
    string Address,
    string? Url
)
{
    public static NftOwnerResponse? FromDomain(NftArt nftArt)
    {
        var owner = nftArt.Owners?.FirstOrDefault();

        if (owner is null)
            return null;

        return new NftOwnerResponse(Address: owner.Address, Url: owner.Alias);
    }
}
