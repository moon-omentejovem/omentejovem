using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetNftEvents;

public record GetNftEventsResponse
{
    [JsonProperty("asset_events")]
    public NftEventResponse[] AssetEvents { get; init; }

    [JsonProperty("next")]
    public string Next { get; init; }
}