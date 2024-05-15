using DbSeeder.OpenSea.Models.GetNftEvents;
using Domain.Models;

namespace DbSeeder.OpenSea.Mappers;

public static class NftEventMapper
{
    public static NftTransferEvent ToDomain(this NftEventResponse nftEvent)
    {
        var nft = nftEvent.NFT ?? nftEvent.Asset;
        var fromAddress = nftEvent.Maker ?? nftEvent.FromAddress;
        var toAddress = nftEvent.Taker ?? nftEvent.ToAddress;

        return new NftTransferEvent
        {
            Transaction = nftEvent.Transaction,
            FromAddress = fromAddress,
            ToAddress = toAddress,
            EventTimestamp = nftEvent.EventTimestamp,
            EventType = nftEvent.EventType,
            NftIdentifier = nft.Identifier
        };
    }
}