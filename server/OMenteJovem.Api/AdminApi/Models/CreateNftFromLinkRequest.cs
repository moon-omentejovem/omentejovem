using Domain.Models.Enums;

namespace AdminApi.Models;

public class CreateNftFromLinkRequest
{
    public string ContractAddress { get; set; } = string.Empty;
    public string NftId { get; set; } = string.Empty;
    public NftChain NftChain { get; set; }
}
