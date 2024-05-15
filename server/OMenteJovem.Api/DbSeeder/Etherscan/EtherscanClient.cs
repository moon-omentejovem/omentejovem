using DbSeeder.Etherscan.Models;
using Newtonsoft.Json;

namespace DbSeeder.Etherscan;

public class EtherscanClient
{
    private static readonly string API_BASE_URL = "https://api.opensea.io/api/v2/";

    private static readonly HttpClient _httpClient = new()
    {
        BaseAddress = new Uri(API_BASE_URL)
    };

    private readonly string _apiKey;

    public EtherscanClient(EtherscanConfig etherscanConfig)
    {
        _apiKey = etherscanConfig.ApiKey;
    }

    public async Task<List<EthereumTransaction>> GetTokenTransactions(string tokenAddress)
    {
        int page = 0;
        int offset = 100;
        var transfers = new List<EthereumTransaction>();

        List<EthereumTransaction> currentContent;

        do
        {
            var response = await _httpClient.GetAsync($"?module=account&action=txlist&address={tokenAddress}&startblock=0&endblock=99999999999&page={page}&offset={offset}&sort=asc&apikey={_apiKey}");

            var stringContent = await response.Content.ReadAsStringAsync();

            var deserializedContent = JsonConvert.DeserializeObject<EtherscanResponse>(stringContent);

            transfers.AddRange(deserializedContent!.Result.Where(r =>
                r.FunctionName.Contains("transfer", StringComparison.InvariantCultureIgnoreCase) ||
                r.FunctionName.Contains("mint", StringComparison.InvariantCultureIgnoreCase) ||
                r.FunctionName.Contains("burn", StringComparison.InvariantCultureIgnoreCase) ||
                r.FunctionName.Contains("approval", StringComparison.InvariantCultureIgnoreCase))
            );

            currentContent = deserializedContent.Result;
        }
        while (currentContent.Count > 0);

        return transfers;
    }
}