using AdminApi.Models;
using Domain.Models;
using Domain.Utils;

namespace AdminApi.Mappers;

public static class MappingMethods
{
    public static NftArtResponse MapToResponse(NftArt original)
    {
        return new NftArtResponse
        {
            Id = original.Id,
            SourceId = original.SourceId,
            Name = original.Name,
            Description = original.Description,
            CreatedAt = original.MintedEvent is null ? null : NftConstants.ParsePosixTimestamp(original.MintedEvent!.EventTimestamp),
            AvailablePurchase = original.AvailablePurchase != null ? MapToResponse(original.AvailablePurchase) : null,
            Address = original.Address,
            MintedDate = original.MintedDate,
            Owners = original.Owners?.Select(o => MapToResponse(o)).ToList(),
            Url = original.Url,
            Contracts = original.Contracts?.Select(c => MapToResponse(c)).ToList(),
            NftUrl = original.NftUrl,
            MakeOffer = original.MakeOffer != null ? MapToResponse(original.MakeOffer) : null,
            VideoProcess = original.VideoProcess,
            NftChain = original.NftChain,
            Etherscan = original.Etherscan,
            Collection = original.Collection,
            OneOfOne = original.OneOfOne,
            Edition = original.Edition,
            ExternalLinks = MapToResponse(original.ExternalLinks),
            LowestCompressionUrl = original.OptimizedImages?.ResizedImages?.OrderByDescending(i => i.Height)?.FirstOrDefault()?.Source
        };
    }

    public static AvailablePurchaseResponse MapToResponse(AvailablePurchase original)
    {
        return new AvailablePurchaseResponse
        {
            Active = original.Active,
            Text = original.Text,
            Url = original.Url
        };
    }

    public static OwnerResponse MapToResponse(Owner original)
    {
        return new OwnerResponse
        {
            Address = original.Address,
            Alias = original.Alias
        };
    }

    public static ContractResponse MapToResponse(Contract original)
    {
        return new ContractResponse
        {
            NftChain = original.NftChain,
            ContractAddress = original.ContractAddress,
            SourceId = original.SourceId
        };
    }

    public static MakeOfferResponse MapToResponse(MakeOffer original)
    {
        return new MakeOfferResponse
        {
            Active = original.Active,
            ButtonText = original.ButtonText
        };
    }

    public static ExternalLinksResponse MapToResponse(ExternalLinks original)
    {
        return new ExternalLinksResponse(original.Links.Select(l => new ExternalLinkResponse(l.Name.ToString(), l.Url)).ToList());
    }

    public static CollectionResponse MapToResponse(Collection collection)
    {
        return new CollectionResponse
        {
            Id = collection.Id.ToString(),
            Name = collection.Name,
            Year = collection.Year,
            Visible = collection.Visible,
        };
    }
}

