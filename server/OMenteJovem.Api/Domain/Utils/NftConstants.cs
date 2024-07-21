using Domain.Models.Enums;

namespace Domain.Utils;

public static class NftConstants
{
    public static readonly string NullAddress = "0x0000000000000000000000000000000000000000";

    public static readonly Dictionary<NftChain, string[]> AvailablePurchaseMapping = new()
    {
        { NftChain.Ethereum, [ "Manifold", "Transient Labs", "SuperRare", "OpenSea", "Rarible" ] },
        { NftChain.Tezos, [ "Hen", "objkt", "objkt.one" ] }
    };

    public static DateTime ParsePosixTimestamp(long posixTimestamp) 
        => DateTimeOffset.FromUnixTimeSeconds(posixTimestamp).UtcDateTime;
}