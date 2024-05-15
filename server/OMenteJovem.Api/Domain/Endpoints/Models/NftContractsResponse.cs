namespace Domain.Endpoints.Models;

public record NftContractsResponse(
     NftContractResponse Eth,
     NftContractResponse Xtz
);

public record NftContractResponse(
);