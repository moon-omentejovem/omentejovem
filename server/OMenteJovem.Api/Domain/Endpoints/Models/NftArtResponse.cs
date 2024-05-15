using Domain.Models;

namespace Domain.Endpoints.Models;

public record NftArtResponse(
    string Name,
    string? Url,
    string? Description,
    DateTime? CreatedAt,
    NftAvailablePurchaseResponse AvailablePurchase,
    NftContractsResponse Contracts,
    string? VideoProcess,
    NftChain NftChain,
    bool Etherscan,
    string Id,
    string Address,
    DateTime MintedDate,
    string? NftUrl,
    MakeOffer? MakeOffer,
    NftOwnerResponse? Owner,
    IEnumerable<NftTransactionResponse> Transactions,
    IEnumerable<NftExternalLinkResponse> ExternalLinks

//string? Collection,
//bool OneOfOne,
//bool Edition,
//ExternalLinks ExternalLinks,
)
{
    public static NftArtResponse FromDomain(NftArt nftArt)
    {
        return new NftArtResponse(
            Name: nftArt.Name,
            Url: nftArt.NftUrl,
            Description: nftArt.Description,
            CreatedAt: nftArt.CreatedAt,
            AvailablePurchase: NftAvailablePurchaseResponse.FromDomain(),
            Contracts: new NftContractsResponse(Eth: new(), Xtz: new()),
            VideoProcess: nftArt.VideoProcess,
            NftChain: nftArt.NftChain,
            Etherscan: nftArt.Etherscan,
            Id: nftArt.SourceId,
            Address: nftArt.Address,
            MintedDate: nftArt.MintedDate,
            NftUrl: nftArt.NftUrl,
            MakeOffer: new MakeOffer(Active: true, ButtonText: null),
            Owner: NftOwnerResponse.FromDomain(nftArt),
            Transactions: [],
            ExternalLinks: FromDomain(nftArt.ExternalLinks)
        //Collection: nftArt.Collection,
        //OneOfOne: nftArt.OneOfOne,
        //Edition: nftArt.Edition,
        //ExternalLinks: nftArt.ExternalLinks,
        ); ;
    }

    private static IEnumerable<NftExternalLinkResponse> FromDomain(ExternalLinks externalLinks)
    {
        return externalLinks.Links.Select(l => new NftExternalLinkResponse(l.Name.ToString(), l.Url));
    }
}