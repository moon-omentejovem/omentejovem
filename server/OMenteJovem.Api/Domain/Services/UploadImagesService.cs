using Domain.Database;
using Domain.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using TinifyAPI;

namespace Domain.Services;

public class UploadImagesService(S3UploadService s3UploadService, IMongoDatabase mongoDatabase, ILogger<UploadImagesService> logger)
{
    private readonly IMongoCollection<NftArt> _nftsCollection = mongoDatabase.GetCollection<NftArt>(MongoDbConfig.NftArtsCollectionName);

    public async Task OptimizeImages(NftArt nft)
    {
        var (contentType, _) = await GetContentType(nft.NftUrl!);

        var fileExtension = contentType.Split('/')[1];

        var source = await Tinify.FromUrl(nft.NftUrl);

        var images = await UploadAllImages(source, nft.Id.ToString(), nft.Name, fileExtension, contentType);

        var optimizedImages = new OptimizedImages
        {
            OriginalCompression = images.OriginalCompression,
            ResizedImages = new()
            {
                new ResizedImage
                {
                    Height = 720,
                    Source = images.Resized720
                },
                new ResizedImage
                {
                    Height = 1080,
                    Source = images.Resized1080
                }
            }
        };

        await _nftsCollection.UpdateOneAsync(n => n.Id == nft.Id, Builders<NftArt>.Update
            .Set(n => n.NftUrl, images.NftUrl)
            .Set(n => n.OptimizedImages, optimizedImages)
        );
    }

    public async Task<(string nftUrl, OptimizedImages)> OptimizeImages(ObjectId nftId, string nftName, Stream fileStream, string contentType)
    {
        var fileExtension = contentType.Split('/')[1];

        var byteArray = await GetByteArrayContent(fileStream);

        var source = await Tinify.FromBuffer(byteArray);

        var images = await UploadAllImages(source, nftId.ToString(), nftName, fileExtension, contentType);

        var optimizedImages = new OptimizedImages
        {
            OriginalCompression = images.OriginalCompression,
            ResizedImages =
            [
                new ResizedImage
                {
                    Height = 720,
                    Source = images.Resized720
                },
                new ResizedImage
                {
                    Height = 1080,
                    Source = images.Resized1080
                }
            ]
        };

        await _nftsCollection.UpdateOneAsync(n => n.Id == nftId, Builders<NftArt>.Update
            .Set(n => n.NftUrl, images.NftUrl)
            .Set(n => n.OptimizedImages, optimizedImages)
        );

        return (images.NftUrl, optimizedImages);
    }

    private static async Task<byte[]> GetByteArrayContent(Stream stream)
    {
        using var memoryStream = new MemoryStream((int)stream.Length);
        await stream.CopyToAsync(memoryStream);
        var byteArray = memoryStream.ToArray();

        return byteArray;
    }

    private async Task<UploadedImages> UploadAllImages(Source source, string nftId, string nftName, string fileExtension, string contentType)
    {
        var newNftUrl = await s3UploadService.UploadAsync(
            GetNormalizedImageName(nftId.ToString(), nftName, fileExtension),
            new MemoryStream(await source.ToBuffer()),
            contentType
        );

        var originalCompression = await s3UploadService.UploadAsync(
            GetOriginalCompressionName(nftId.ToString(), nftName, fileExtension),
            new MemoryStream(await source.ToBuffer()),
            contentType
        );

        var resizedFullHd = await s3UploadService.UploadAsync(
            Get1080CompressionName(nftId.ToString(), nftName, fileExtension),
            new MemoryStream(await source.Resize(new
            {
                method = "scale",
                height = 1080
            }).ToBuffer()),
            contentType
        );

        var resizedHd = await s3UploadService.UploadAsync(
            Get720CompressionName(nftId.ToString(), nftName, fileExtension),
            new MemoryStream(await source.Resize(new
            {
                method = "scale",
                height = 720
            }).ToBuffer()),
            contentType
        );

        return new UploadedImages(newNftUrl, originalCompression, resizedFullHd, resizedHd);
    }

    private static string GetNormalizedName(string nftName)
    {
        return nftName.ToLower().Replace('/', ' ').Replace(' ', '-');
    }

    private static string GetNormalizedImageName(string nftId, string nftName, string fileExtension)
    {
        var normalizedName = GetNormalizedName(nftName);

        return $"{nftId}/{normalizedName}.{fileExtension}";
    }

    private static string GetOriginalCompressionName(string nftId, string nftName, string fileExtension)
    {
        var normalizedName = GetNormalizedName(nftName);

        return $"{nftId}/compressed_{normalizedName}.{fileExtension}";
    }

    private static string Get1080CompressionName(string nftId, string nftName, string fileExtension)
    {
        var normalizedName = GetNormalizedName(nftName);

        return $"{nftId}/resized_1920_{normalizedName}.{fileExtension}";
    }

    private static string Get720CompressionName(string nftId, string nftName, string fileExtension)
    {
        var normalizedName = GetNormalizedName(nftName);

        return $"{nftId}/resized_1280_{normalizedName}.{fileExtension}";
    }

    private async Task<string> UploadImage(NftArt nft, string fileName, string contentType, MemoryStream contentStream)
    {
        var uploadedUrl = await s3UploadService.UploadAsync($"{nft.Id}/{fileName}", contentStream, contentType);

        return uploadedUrl;
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

    record UploadedImages(string NftUrl, string OriginalCompression, string Resized1080, string Resized720);
}