namespace DbSeeder.Objkt.Models.GetTokenActivity;
public record GetEventsResponse
{
    public List<GetEventResponse> Event { get; init; }
}