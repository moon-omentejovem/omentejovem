using AdminApi.Models.Forms;
using Domain.Models;

namespace AdminApi.Mappers;

public static class FormMapper
{
    public static NftArtForm FromDomain(NftArt nftArt)
    {
        return new NftArtForm
        {
            SourceId = nftArt.SourceId,
            Name = nftArt.Name,
            Description = nftArt.Description,
            CreatedAt = nftArt.CreatedAt,
            Address = nftArt.Address,
            MintedDate = nftArt.MintedDate,
            Url = nftArt.Url,
            NftUrl = nftArt.NftUrl,
            VideoProcess = nftArt.VideoProcess,
            NftChain = nftArt.NftChain,
            Collection = nftArt.Collection,
            OneOfOne = nftArt.OneOfOne,
            Edition = nftArt.Edition,
            OptimizedImages = nftArt.OptimizedImages
        };
    }

    public static LinksForm FromDomain(ExternalLinks links)
    {
        return new LinksForm
        {
            ExternalLinks = links.Links.Select(l => new LinkForm
            {
                Name = l.Name.ToString(),
                Url = l.Url,
            }).ToList()
        };
    }

    public static ExternalLinks ToDomain(LinksForm links)
    {
        var externalLinks = new ExternalLinks();
        foreach (var link in links.ExternalLinks)
        {
            externalLinks.AddLink(new ExternalLink 
            { 
                Name = Enum.Parse<ExternalLinkEnum>(link.Name), 
                Url = link.Url 
            });
        }
        return externalLinks;
    }
}
