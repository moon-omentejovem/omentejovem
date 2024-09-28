using Domain.Models;
using Domain.Models.Enums;
using Domain.OpenSea.Models.GetNft;
using Domain.OpenSea.Models.ListNfts;

namespace Domain.OpenSea.Mappers;

public static class NftMapper
{
    public static NftArt ToDomain(this ListNftResponse nftResponse)
    {
        return new NftArt
        {
            Name = nftResponse.Name,
            Address = nftResponse.Contract,
            NftUrl = nftResponse.ImageUrl,
            NftChain = NftChain.Ethereum,
            Collection = nftResponse.Collection,
            SourceId = nftResponse.Identifier,
            ExternalLinks = new(new() { Name = ExternalLinkEnum.OpenSea, Url = nftResponse.OpenseaUrl })
        };
    }

    public static NftArt FillSingleNft(this NftArt nftArt, NftResponse nftResponse)
    {
        nftArt.CreatedAt = DateTime.Parse(nftResponse.UpdatedAt);
        nftArt.Edition = nftResponse.TokenStandard == "erc1155" || nftResponse.Collection.Contains("edition", StringComparison.InvariantCultureIgnoreCase);

        return nftArt;
    }

}