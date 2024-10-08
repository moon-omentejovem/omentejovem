namespace Domain.OpenSea.Models.GetCollection;

public record PaymentTokenResponse(
    string Symbol,
    string Address,
    string Chain,
    string Image,
    string Name,
    int Decimals,
    string EthPrice,
    string UsdPrice
);