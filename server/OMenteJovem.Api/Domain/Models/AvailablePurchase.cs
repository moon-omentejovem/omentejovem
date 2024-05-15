namespace Domain.Models;

public record AvailablePurchase(
    bool Active,
    bool Status,
    string Text,
    string TextAvailable,
    string Url
);
