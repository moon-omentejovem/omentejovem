using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetNftEvents;

public record CriteriaResponse
{
    [JsonProperty("collection")]
    public CollectionResponse Collection { get; init; }

    [JsonProperty("contract")]
    public ContractResponse Contract { get; init; }

    [JsonProperty("trait")]
    public TraitResponse Trait { get; init; }

    [JsonProperty("encoded_token_ids")]
    public string EncodedTokenIds { get; init; }
}