using Domain.Models.Enums;

namespace AdminApi.Models;

public class CreateNftFromScratchRequest
{
    public string ContractAddress { get; set; } = string.Empty;
    public string NftId { get; set; } = string.Empty;
    public NftChain NftChain { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Collection { get; set; } = string.Empty;
}
