namespace DbSeeder.Etherscan.Models;

public class EthereumTransaction
{
    public string BlockNumber { get; set; } = string.Empty;
    public string TimeStamp { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
    public string Nonce { get; set; } = string.Empty;
    public string BlockHash { get; set; } = string.Empty;
    public string TransactionIndex { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Gas { get; set; } = string.Empty;
    public string GasPrice { get; set; } = string.Empty;
    public string IsError { get; set; } = string.Empty;
    public string TxReceiptStatus { get; set; } = string.Empty;
    public string Input { get; set; } = string.Empty;
    public string ContractAddress { get; set; } = string.Empty;
    public string CumulativeGasUsed { get; set; } = string.Empty;
    public string GasUsed { get; set; } = string.Empty;
    public string Confirmations { get; set; } = string.Empty;
    public string MethodId { get; set; } = string.Empty;
    public string FunctionName { get; set; } = string.Empty;
}