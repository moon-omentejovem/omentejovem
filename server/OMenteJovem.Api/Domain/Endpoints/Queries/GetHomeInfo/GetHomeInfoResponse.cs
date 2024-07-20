namespace Domain.Endpoints.Queries.GetHomeInfo;

public record GetHomeInfoResponse(
    string Title,
    string Subtitle,
    IEnumerable<GetHomeInfoNftResponse> Nfts
);

public record GetHomeInfoNftResponse(
    string Title,
    DateTime? CreatedAt,
    string ImageUrl
);