namespace AdminApi.Models;

public record OwnerResponse
{
    public string Address { get; set; }
    public string? Alias { get; set; }
}
