using DbSeeder.OpenSea.Models.GetCollection;
using DbSeeder.OpenSea.Models.GetCollections;
using DbSeeder.OpenSea.Models.GetNft;
using DbSeeder.OpenSea.Models.GetNftEvents;
using DbSeeder.OpenSea.Models.ListNfts;
using DbSeeder.Utils;
using Microsoft.Net.Http.Headers;
using Polly;

namespace DbSeeder.OpenSea;

public class OpenSeaClient
{
    private static readonly string API_BASE_URL = "https://api.opensea.io/api/v2";

    private static readonly HttpClient _httpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(1000)
    };

    private readonly OpenSeaConfig _openSeaConfig;
    private readonly ResiliencePipeline _resiliencePipeline;

    public OpenSeaClient(
        OpenSeaConfig openSeaConfig,
        [FromKeyedServices("httpPipeline")]
        ResiliencePipeline resiliencePipeline)
    {
        _httpClient.DefaultRequestHeaders.Add(HeaderNames.Accept, "application/json");
        _httpClient.DefaultRequestHeaders.Add("x-api-key", openSeaConfig.ApiKey);

        _openSeaConfig = openSeaConfig;
        _resiliencePipeline = resiliencePipeline;
    }

    public async Task<ListNftsResponse> ListNftsByCollection(string collectionSlug)
    {
        return await _resiliencePipeline.ExecuteAsync(async (_) =>
        {
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/collection/{collectionSlug}/nfts");

            var deserializedContent = await HttpUtils.DeserializeContent<ListNftsResponse>(response);

            return deserializedContent is null ? throw new Exception() : deserializedContent;
        });
    }

    public async Task<ListNftsResponse> ListArtistNftsByChain(string chain)
    {
        string? next = null;
        var results = new List<ListNftResponse>();

        do
        {
            await _resiliencePipeline.ExecuteAsync(async (_) =>
            {
                var response = await _httpClient.GetAsync($"{API_BASE_URL}/chain/{chain}/account/{_openSeaConfig.CreatorAddress}/nfts?limit=200&" + (next is null ? "" : "next=" + next));

                var deserializedContent = await HttpUtils.DeserializeContent<ListNftsResponse>(response);

                next = deserializedContent!.Next;

                results.AddRange(deserializedContent.Nfts);
            });
        }
        while (!string.IsNullOrEmpty(next));

        return new ListNftsResponse(results, null);
    }

    public async Task<GetNftResponse> GetNft(string chain, string address, string identifier)
    {
        return await _resiliencePipeline.ExecuteAsync(async (_) =>
        {
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/chain/{chain}/contract/{address}/nfts/{identifier}");

            var deserializedContent = await HttpUtils.DeserializeContent<GetNftResponse>(response);

            return deserializedContent is null || deserializedContent.Nft is null ? throw new Exception() : deserializedContent;
        });
    }

    public async Task<GetNftEventsResponse> GetNftEvents(string addressId, string nftId)
    {
        string? next = null;
        var results = new List<NftEventResponse>();

        do
        {
            await _resiliencePipeline.ExecuteAsync(async (_) =>
            {
                var response = await _httpClient.GetAsync($"{API_BASE_URL}/events/chain/ethereum/contract/{addressId}/nfts/{nftId}?next={next}&event_type=transfer&event_type=sale");

                var deserializedContent = await HttpUtils.DeserializeContent<GetNftEventsResponse>(response);

                next = deserializedContent!.Next;

                results.AddRange(deserializedContent.AssetEvents);
            });
        }
        while (!string.IsNullOrEmpty(next));

        return new GetNftEventsResponse { AssetEvents = results.ToArray() };
    }

    public async Task<GetCollectionsResponse> GetCollections()
    {
        return await _resiliencePipeline.ExecuteAsync(async (_) =>
        {
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/collections?creator_username={_openSeaConfig.CreatorUsername}");

            var deserializedContent = await HttpUtils.DeserializeContent<GetCollectionsResponse>(response);

            return deserializedContent is null ? throw new Exception() : deserializedContent;
        });
    }

    public async Task<GetCollectionResponse> GetCollection(string collectionSlug)
    {
        return await _resiliencePipeline.ExecuteAsync(async (_) =>
        {
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/collections/{collectionSlug}");

            var deserializedContent = await HttpUtils.DeserializeContent<GetCollectionResponse>(response);

            return deserializedContent is null ? throw new Exception() : deserializedContent;
        });
    }
}