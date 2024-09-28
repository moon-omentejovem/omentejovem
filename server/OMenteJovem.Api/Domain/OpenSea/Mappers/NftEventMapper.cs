using Domain.Models;
using Domain.OpenSea.Models.GetNftEvents;
using System.Net;

namespace Domain.OpenSea.Mappers;

public static class NftEventMapper
{
    public static NftTransferEvent ToDomain(this NftEventResponse nftEvent)
    {
        var (fromAddress, toAddress) = nftEvent.EventType == "sale"
            ? (nftEvent.Seller, nftEvent.Buyer)
            : (nftEvent.FromAddress, nftEvent.ToAddress);

        return new NftTransferEvent
        {
            Transaction = nftEvent.Transaction,
            FromAddress = fromAddress,
            ToAddress = toAddress,
            EventTimestamp = nftEvent.EventTimestamp,
            EventType = nftEvent.EventType,
            NftIdentifier = nftEvent.NFT.Identifier,
            Quantity = nftEvent.Quantity
        };
    }

    public static (string, string) GetSaleFromAndToAddresses(NftEventResponse nftEvent)
    {
        return (nftEvent.Seller, nftEvent.Buyer);
    }
}