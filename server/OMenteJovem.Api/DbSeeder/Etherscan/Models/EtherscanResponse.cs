namespace DbSeeder.Etherscan.Models;

public class EtherscanResponse
{
    public string Status { get; set; }
    public string Message { get; set; }
    public List<EthereumTransaction> Result { get; set; }
}