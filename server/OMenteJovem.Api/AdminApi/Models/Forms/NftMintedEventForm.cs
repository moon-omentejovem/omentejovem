using MongoDB.Bson;

namespace AdminApi.Models.Forms;

public class NftMintedEventForm
{
    public ObjectId Id { get; set; }
    public string Transaction { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int Quantity { get; set; }
}