using DbSeeder.Objkt.Models.GetArtistTokens;
using Domain.Models;
using Domain.Models.Enums;

namespace DbSeeder.Objkt.Mappers;

public static class TokenMapper
{
    public static NftArt ToDomain(this TokenResponse token)
    {
        return new NftArt
        {
            NftChain = NftChain.Tezos,
            SourceId = token.TokenId,
            Address = token.FaContract,
            Name = token.Name,
            Url = $"https://cloudflare-ipfs.com/ipfs/{token.DisplayUri.Split("/")[^1]}",
            NftUrl = $"https://cloudflare-ipfs.com/ipfs/{token.ArtifactUri.Split("/")[^1]}",
            Description = token.Description,
            MintedDate = DateTime.Parse(token.Timestamp),
            Collection = token.Fa.Name,
        };
    }

    public static Owner ToDomain(this HolderResponse holderResponse)
    {
        return new Owner { Address = holderResponse.Address, Alias = holderResponse.Alias };
    }
}