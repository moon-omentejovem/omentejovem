using Domain.Database;
using Domain.Models;
using Domain.Models.Enums;
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

        existentNft.Address = request.ContractAddress;
        existentNft.SourceId = request.TokenId;
        existentNft.NftChain = NftChain.Ethereum;
        existentNft.Collection = request.Collection;
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

        if (
            existentNft.OptimizedImages == null 
            || 
                (existentNft.OptimizedImages != null && 
                string.IsNullOrEmpty(existentNft.OptimizedImages.OriginalCompression) &&
                existentNft.OptimizedImages.ResizedImages.Any())
        )
        {
            await OptimizeImages(existentNft);
        }

        return existentNft;
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

        var (contentType, responseContent) = await GetContentType(nft.NftUrl);

        var fileExtension = contentType.Split('/')[1];

        var source = Tinify.FromUrl(nft.NftUrl);

        var nftName = nft.Name.ToLower().Replace('/', ' ').Replace(' ', '-');

        var newNftUrl = await s3UploadService.UploadAsync($"{nft.Id}/{nftName}.{fileExtension}", new MemoryStream(await source.ToBuffer()), contentType);

        var originalCompression = await s3UploadService.UploadAsync($"{nft.Id}/compressed_{nftName}.{fileExtension}", new MemoryStream(await source.ToBuffer()), contentType);

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
            .Set(n => n.NftUrl, newNftUrl)
            .Set(n => n.OptimizedImages, optimizedImages)
        );
    }

    private async Task<(string, HttpContent)> GetContentType(string sourceUrl)
    {
        var httpClient = new HttpClient();

        var response = await httpClient.GetAsync(sourceUrl);

        try
        {
            var contentType = response.Headers.FirstOrDefault(k => k.Key == "ContentType");

            if (contentType.Key is not null && contentType.Value is not null)
            {
                return (contentType.Value.First(), response.Content);
            }
        }
        catch
        {
            logger.LogWarning("Failed to determine content type for nft url {SourceUrl}", sourceUrl);
        }

        return ("image/jpeg", response.Content);
    }
}