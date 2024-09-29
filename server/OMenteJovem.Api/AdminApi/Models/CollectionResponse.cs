namespace AdminApi.Models;

public class CollectionResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Year { get; set; }
    public bool Visible { get; set; }
    public string SourceId { get; set; } = string.Empty;
}