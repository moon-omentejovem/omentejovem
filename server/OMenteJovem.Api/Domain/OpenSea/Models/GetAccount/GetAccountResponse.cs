using Newtonsoft.Json;

namespace Domain.OpenSea.Models.GetAccount;

public class GetAccountResponse
{
    public string Address { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public DateTime JoinedDate { get; set; }

    [JsonProperty("profile_image_url")]
    public string ProfileImageUrl { get; set; } = string.Empty;

    [JsonProperty("banner_image_url")]
    public string BannerImageUrl { get; set; } = string.Empty;

    [JsonProperty("social_media_accounts")]
    public IEnumerable<OwnerSocialMediaResponse> SocialMediaAccounts = [];
}
