using Domain.Models;

namespace Domain.Endpoints.Models;

public record NftAvailablePurchaseResponse(
    string Text,
    string Url
)
{
    public static NftAvailablePurchaseResponse? FromDomain(AvailablePurchase? availablePurchase)
    {
        if (availablePurchase is null)
        {
            return null;
        }
        if (!availablePurchase.Active)
        {
            return null;
        }

        return new NftAvailablePurchaseResponse(availablePurchase.Text, availablePurchase.Url);
    } 
}
