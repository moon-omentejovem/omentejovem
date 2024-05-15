namespace Domain.Models;

public record NftData(
    string Opensea,
    bool Etherscan,
    Objkt Objkt,
    string CreationDate,
    int Quantity,
    string VideoProcess,
    string Description,
    AvailablePurchase AvailablePurchase,
    MakeOffer MakeOffer,
    List<Contract> Contracts
);