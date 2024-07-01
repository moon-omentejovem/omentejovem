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
    DateTime? MintedDate,
    string? NftUrl,
    string? NftCompressedUrl,
    string? NftCompressedFullHdUrl,
    string? NftCompressedHdUrl,
    MakeOffer? MakeOffer,
    IEnumerable<NftOwnerResponse> Owners,
    IEnumerable<NftExternalLinkResponse> ExternalLinks,
    NftTransferEventResponse? MintedEvent,
    NftTransferEventResponse? LastEvent
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
            NftCompressedUrl: nftArt.OptimizedImages?.OriginalCompression,
            NftCompressedFullHdUrl: nftArt.OptimizedImages?.ResizedImages.FirstOrDefault(i => i.Height == 1080)?.Source,
            NftCompressedHdUrl: nftArt.OptimizedImages?.ResizedImages.FirstOrDefault(i => i.Height == 720)?.Source,
            MakeOffer: new MakeOffer { Active = true, ButtonText = null },
            Owners: NftOwnerResponse.FromDomain(nftArt),
            ExternalLinks: FromDomain(nftArt.ExternalLinks),
            MintedEvent: NftTransferEventResponse.FromDomain(nftArt.MintedEvent),
            LastEvent: NftTransferEventResponse.FromDomain(nftArt.LastTransferEvent)
        );
    }

    private static IEnumerable<NftExternalLinkResponse> FromDomain(ExternalLinks externalLinks)
    {
        return externalLinks.Links.Select(l => new NftExternalLinkResponse(l.Name.ToString(), l.Url));
    }
}