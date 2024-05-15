namespace Domain.Endpoints.Models;

public record NftTransactionResponse(
    string Transaction,
    string FromAddress,
    string ToAddress,
    string EventTimestamp,
    string EventType = "transfer",
    string Chain = "ethereum"
);