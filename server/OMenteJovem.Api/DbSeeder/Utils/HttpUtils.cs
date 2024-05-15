using Newtonsoft.Json;

namespace DbSeeder.Utils;

public static class HttpUtils
{
    public static async Task<TObject?> DeserializeContent<TObject>(HttpResponseMessage response)
    {
        string content = await response.Content.ReadAsStringAsync();
        var deserializedContent = JsonConvert.DeserializeObject<TObject>(content);

        return deserializedContent;
    }
}