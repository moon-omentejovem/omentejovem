using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;

namespace Domain.Services;

public class S3UploadService(IAmazonS3 client, AWSConfig awsConfig, ILogger<S3UploadService> logger)
{
    public async Task<string> UploadAsync(string keyName, Stream content, string mimeType)
    {
        logger.LogInformation("Uploading file to S3");

        var putRequest = new PutObjectRequest
        {
            BucketName = awsConfig.BucketName,
            Key = keyName,
            InputStream = content,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
            ContentType = mimeType,
        };

        await client.PutObjectAsync(putRequest);

        logger.LogInformation("Uploaded file to S3");

        return $"{awsConfig.CloudFrontBaseUrl}/{keyName}";
    }
}
