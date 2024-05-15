using Newtonsoft.Json;
using System.Text.Json;

var httpClient = new HttpClient()
{
    BaseAddress = new Uri("https://api.etherscan.io/api")
};

var page = 0;
var offset = 1000;
var address = "0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43";
var omentejovemAddress = "0x116723a14c7ee8ac3647d37bb5e9f193c29b3489";
var apiKey = "MK6GR5KB4JFKJWSNIIZPF8BXDNZGRJYGBD";

await GetTokenTransferTransactionsByAddress(omentejovemAddress);

// https://docs.etherscan.io/api-endpoints/tokens#get-address-erc721-token-inventory-by-contract-address

async Task GetERC721TokenInventoryByContractAddress(string contractAddress)
{

}

async Task GetContractInfo(string internalAddress)
{
    ///https://docs.etherscan.io/api-endpoints/contracts#get-contract-abi-for-verified-contract-source-codes

    var response = await httpClient.GetAsync($"?module=contract&action=getcontractcreation&contractaddresses={internalAddress}&apikey={apiKey}");

    var stringContent = await response.Content.ReadAsStringAsync();

    var deserialized = JsonConvert.DeserializeObject<Root>(stringContent);

    Console.WriteLine(deserialized);
}

async Task GetNormalTransactionsByAddress()
{
    ///https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address
    var content = new List<EthereumTransaction>();
    var transfers = new List<EthereumTransaction>();

    int transferCount = 0;

    do
    {
        var response = await httpClient.GetAsync($"?module=account&action=txlist&address={address}&startblock=0&endblock=99999999999&page={page}&offset={offset}&sort=asc&apikey={apiKey}");

        var stringContent = await response.Content.ReadAsStringAsync();

        var deserialized = JsonConvert.DeserializeObject<EtherscanResponse>(stringContent);

        transfers.AddRange(deserialized.Result.Where(r =>
            r.FunctionName.Contains("transfer", StringComparison.InvariantCultureIgnoreCase) ||
            r.FunctionName.Contains("mint", StringComparison.InvariantCultureIgnoreCase) ||
            r.FunctionName.Contains("burn", StringComparison.InvariantCultureIgnoreCase) ||
            r.FunctionName.Contains("approval", StringComparison.InvariantCultureIgnoreCase))
        );

        transferCount += transfers.Count();

        content = deserialized.Result;

        page++;
    }
    while (content.Count > 0);

    transfers = transfers.DistinctBy(r => r.Hash).ToList();

    var special = transfers.Select(t => new
    {
        t.Hash,
        t.FunctionName
    });

    Console.WriteLine(transfers.Count);
}

async Task GetTokenTransferTransactionsByAddress(string internalAddress)
{
    var content = new List<EthereumTransaction>();
    var transfers = new List<EthereumTransaction>();

    int transferCount = 0;

    do
    {
        var response = await httpClient.GetAsync($"?module=account&action=tokennfttx&address={internalAddress}&startblock=0&endblock={int.MaxValue}&page={page}&offset={offset}&sort=asc&apikey={apiKey}");

        var stringContent = await response.Content.ReadAsStringAsync();

        if (stringContent.Contains("Max rate limit reached"))
        {
            await Task.Delay(1000);
            continue;
        }

        var deserialized = JsonConvert.DeserializeObject<EtherscanResponse>(stringContent);

        transfers.AddRange(deserialized.Result);

        transferCount += transfers.Count();

        content = deserialized.Result;

        page++;
    }
    while (content.Count > 0);

    var myTx = transfers.FirstOrDefault(f => f.BlockHash == "0x6f8871be36956855a5bc8f3227bae65abfb9e3f19c857e79822676b5e4f55a21");

    transfers = transfers.DistinctBy(r => r.Hash).ToList();

    var special = transfers.Select(t => new
    {
        t.Hash,
        t.FunctionName
    });

    Console.WriteLine(transfers.Count);
}

public class EtherscanResponse
{
    public string Status { get; set; }
    public string Message { get; set; }
    public List<EthereumTransaction> Result { get; set; }
}

public class EthereumTransaction
{
    public string BlockNumber { get; set; }
    public string TimeStamp { get; set; }
    public string Hash { get; set; }
    public string Nonce { get; set; }
    public string BlockHash { get; set; }
    public string TransactionIndex { get; set; }
    public string From { get; set; }
    public string To { get; set; }
    public string Value { get; set; }
    public string Gas { get; set; }
    public string GasPrice { get; set; }
    public string IsError { get; set; }
    public string TxReceiptStatus { get; set; }
    public string Input { get; set; }
    public string ContractAddress { get; set; }
    public string CumulativeGasUsed { get; set; }
    public string GasUsed { get; set; }
    public string Confirmations { get; set; }
    public string MethodId { get; set; }
    public string FunctionName { get; set; }
    public string TokenId { get; set; }
    public string TokenName { get; set; }
    public string TokenSymbol { get; set; }
    public string TokenDecimal { get; set; }
}

public class ContractInfo
{
    public string ContractAddress { get; set; }
    public string ContractCreator { get; set; }
    public string TxHash { get; set; }
}

public class Root
{
    public string Status { get; set; }
    public string Message { get; set; }
    public List<ContractInfo> Result { get; set; }
}