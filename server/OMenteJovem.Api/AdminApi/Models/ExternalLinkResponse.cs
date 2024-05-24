namespace AdminApi.Models;

public record ExternalLinkResponse(
    string Name,
    string Url
);

public record ExternalLinksResponse(List<ExternalLinkResponse> ExternalLinks);