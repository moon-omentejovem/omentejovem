using Domain.Models;
using Domain.Utils;

namespace Domain.Endpoints.Models;

public record NftTransferEventResponse(
    string FromAddress,
    string ToAddress,
    DateTime EventDate,
    string EventType
)
{
    public static NftTransferEventResponse? FromDomain(NftTransferEvent? nftTransferEvent)
    {
        if (nftTransferEvent == null)
            return null;

        return new(
            FromAddress: nftTransferEvent.FromAddress,
            ToAddress: nftTransferEvent.ToAddress,
            EventDate: NftConstants.ParsePosixTimestamp(nftTransferEvent.EventTimestamp),
            EventType: nftTransferEvent.EventType
        );
    }
}