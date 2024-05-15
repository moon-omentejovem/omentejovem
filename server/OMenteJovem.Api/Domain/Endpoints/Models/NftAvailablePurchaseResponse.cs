namespace Domain.Endpoints.Models;

public record NftAvailablePurchaseResponse(
    bool Active,
    bool Status,
    string Text,
    string TextAvailable,
    string Url
)
{
    public static NftAvailablePurchaseResponse FromDomain()
    {
        return new NftAvailablePurchaseResponse(true, true, "hahaha", "available ", "www.google.com");
    } 
}
