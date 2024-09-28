namespace Domain.OpenSea.Models.GetCollection;

public record FeeResponse(decimal FeeValue, string Recipient, bool Required);
