using Domain.Models.Enums;

namespace AdminApi.Models;

public class ContractResponse
{
    public NftChain NftChain { get; set; }
    public string ContractAddress { get; set; }
    public string SourceId { get; set; }
}
