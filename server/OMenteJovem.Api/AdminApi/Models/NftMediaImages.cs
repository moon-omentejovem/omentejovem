using Domain.Models;

namespace AdminApi.Models;

public class NftMediaImages
{
    public string NftUrl { get; set; }
    public OptimizedImages OptimizedImages { get; set; } = new();
}
