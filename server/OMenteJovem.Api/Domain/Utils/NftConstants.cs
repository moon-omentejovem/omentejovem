namespace Domain.Utils;

public static class NftConstants
{
    public static readonly string NullAddress = "0x0000000000000000000000000000000000000000";

    public static DateTime ParsePosixTimestamp(long posixTimestamp) 
        => DateTimeOffset.FromUnixTimeSeconds(posixTimestamp).UtcDateTime;
}