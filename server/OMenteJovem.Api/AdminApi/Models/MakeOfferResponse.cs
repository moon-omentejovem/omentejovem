namespace AdminApi.Models;

public record MakeOfferResponse
{
    public bool Active { get; set; }
    public string ButtonText { get; set; }
}