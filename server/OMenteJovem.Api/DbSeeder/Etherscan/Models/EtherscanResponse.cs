namespace DbSeeder.Etherscan.Models;

public class EtherscanResponse
{
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<EthereumTransaction> Result { get; set; } = [];
}