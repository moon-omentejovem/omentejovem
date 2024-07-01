using Domain.Database;
using Domain.Models;
using Domain.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using TinifyAPI;

namespace Domain.Endpoints.Commands.CreateOpenSeaNft;

public record CreateOpenSeaNftRequest(
    string Name,
    string Description,
    string ContractAddress,
    string Collection,
    string TokenId,
    string OpenSeaUrl,
    string NftUrl,
    bool Edition,
    List<Owner>? Owners
) : IRequest<NftArt>;

public class CreateOpenSeaNftRequestHandler(
    IMongoDatabase mongoDatabase,
    S3UploadService s3UploadService,
    ILogger<CreateOpenSeaNftRequestHandler> logger
) : IRequestHandler<CreateOpenSeaNftRequest, NftArt>
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task<NftArt> Handle(CreateOpenSeaNftRequest request, CancellationToken cancellationToken)
    {
        var existentNft = await _nftsCollection.Find(n => n.Name == request.Name).FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (existentNft == null)
        {
            var newNft = new NftArt
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.ContractAddress,
                NftChain = NftChain.Ethereum,
                Collection = request.Collection,
                NftUrl = request.NftUrl,
                Edition = request.Edition,
                ExternalLinks = new(new() { Name = ExternalLinkEnum.OpenSea, Url = request.OpenSeaUrl }),
                Contracts =
                [
                    new Contract
                    {
                        ContractAddress = request.ContractAddress,
                        NftChain = NftChain.Ethereum,
                        SourceId = request.TokenId
                    }
                ],
                Owners = request.Owners ?? []
            };

            await _nftsCollection.InsertOneAsync(newNft, cancellationToken: cancellationToken);

            await OptimizeImages(newNft);

            return newNft;
        }

        if (!HasChanges(request, existentNft))
        {
            return existentNft;
        }

        existentNft.Name = request.Name;
        existentNft.Description = request.Description;
        existentNft.Address = request.ContractAddress;
        existentNft.NftChain = NftChain.Ethereum;
        existentNft.Collection = request.Collection;
        existentNft.NftUrl = request.NftUrl;
        existentNft.Edition = request.Edition;
        existentNft.ExternalLinks.AddLink(new() { Name = ExternalLinkEnum.OpenSea, Url = request.OpenSeaUrl });

        if (!existentNft.Contracts.Any(c => c.ContractAddress == request.ContractAddress))
        {
            existentNft.Contracts.Add(new Contract
            {
                ContractAddress = request.ContractAddress.ToLower(),
                NftChain = NftChain.Ethereum,
                SourceId = request.TokenId
            });
        }

        if (existentNft.Owners.Count == 0 && request.Owners.Count > 0)
        {
            existentNft.Owners = request.Owners;
        }

        await _nftsCollection.ReplaceOneAsync(n => n.Id == existentNft.Id, existentNft, cancellationToken: cancellationToken);

        return existentNft;
    }

    private static bool HasChanges(CreateOpenSeaNftRequest request, NftArt nftArt)
    {
        return
            nftArt.Name != request.Name ||
            nftArt.Description != request.Description ||
            nftArt.Address != request.ContractAddress ||
            nftArt.Collection != request.Collection ||
            nftArt.NftUrl != request.NftUrl ||
            !nftArt.ExternalLinks.Links.Any(l => l.Name == ExternalLinkEnum.OpenSea && l.Url == request.OpenSeaUrl) ||
            nftArt.Edition != request.Edition;
    }

    private async Task OptimizeImages(NftArt nft)
    {
        if (nft.OptimizedImages is not null &&
            !string.IsNullOrEmpty(nft.OptimizedImages.OriginalCompression) &&
            nft.OptimizedImages.ResizedImages.Count != 0)
        {
            return;
        }

        if (string.IsNullOrEmpty(nft.NftUrl))
        {
            return;
        }

        var contentType = await GetContentType(nft.NftUrl);

        var fileExtension = contentType.Split('/')[1];

        var source = Tinify.FromUrl(nft.NftUrl);

        var nftName = nft.Name.ToLower().Replace('/', ' ').Replace(' ', '-');

        var originalCompression = await s3UploadService.UploadAsync($"{nft.Id}/{nftName}.{fileExtension}", new MemoryStream(await source.ToBuffer()), contentType);

        var resizedFullHd = await s3UploadService.UploadAsync(
            $"{nft.Id}/resized_1920_{nftName}.{fileExtension}",
            new MemoryStream(await source.Resize(new
            {
                method = "scale",
                height = 1080
            }).ToBuffer()),
            contentType
        );

        var resizedHd = await s3UploadService.UploadAsync(
            $"{nft.Id}/resized_1280_{nftName}.{fileExtension}",
            new MemoryStream(await source.Resize(new
            {
                method = "scale",
                height = 720
            }).ToBuffer()),
            contentType
        );

        var optimizedImages = new OptimizedImages
        {
            OriginalCompression = originalCompression,
            ResizedImages = new()
            {
                new ResizedImage
                {
                    Height = 720,
                    Source = resizedHd
                },
                new ResizedImage
                {
                    Height = 1080,
                    Source = resizedHd
                }
            }
        };

        await _nftsCollection.UpdateOneAsync(n => n.Id == nft.Id, Builders<NftArt>.Update
            .Set(n => n.OptimizedImages, optimizedImages));
    }

    private async Task<string> GetContentType(string sourceUrl)
    {
        var httpClient = new HttpClient();

        try
        {
            var response = await httpClient.GetAsync(sourceUrl);

            var contentType = response.Headers.FirstOrDefault(k => k.Key == "ContentType");

            if (contentType.Value.Any(v => v != null))
            {
                return contentType.Value.First();
            }
        }
        catch
        {
            logger.LogWarning("Failed to determine content type for nft url {SourceUrl}", sourceUrl);
        }

        return "image/jpeg";
    }
}