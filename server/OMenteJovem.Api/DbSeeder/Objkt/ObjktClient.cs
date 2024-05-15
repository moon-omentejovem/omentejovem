using DbSeeder.Objkt.Models.GetArtistTokens;
using GraphQL;
using GraphQL.Client.Http;

namespace DbSeeder.Objkt;

public class ObjktClient
{
    private readonly GraphQLHttpClient _graphClient;
    private readonly ObjktConfig _objktConfig;

    public ObjktClient(GraphQLHttpClient client, ObjktConfig objktConfig)
    {
        _graphClient = client;
        _objktConfig = objktConfig;
    }

    public async Task<GetArtistObjectsResponse> GetArtistTokens()
    {
        var getNftRequest = new GraphQLRequest
        {
            Query = Queries.GetArtistsTokens,
            Variables = new
            {
                creatorAddress = _objktConfig.CreatorAddress
            }
        };

        var response = await _graphClient.SendQueryAsync<GetArtistObjectsResponse>(getNftRequest);

        return response.Data;
    }
}