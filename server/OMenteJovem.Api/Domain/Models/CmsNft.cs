namespace Domain.Models;

public record CmsNft(
    int Id,
    Title Title,
    NftData Acf,
    List<string> SourceUrls
);
