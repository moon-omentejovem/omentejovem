using Amazon.S3;
using Amazon.S3.Model;

namespace AdminApi.Services;

public class S3UploadService(IAmazonS3 client, AWSConfig awsConfig)
{
    public async Task<string> UploadAsync(string keyName, string content)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = awsConfig.BucketName,
            Key = keyName,
            ContentBody = content,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
        };

        await client.PutObjectAsync(putRequest);

        return $"{awsConfig.CloudFrontBaseUrl}/{keyName}";
    }
}
