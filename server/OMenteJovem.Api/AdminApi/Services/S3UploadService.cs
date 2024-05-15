using Amazon.S3;
using Amazon.S3.Model;

namespace AdminApi.Services;

public class S3UploadService(IAmazonS3 client, AWSConfig awsConfig)
{
    public async Task UploadAsync(string keyName)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = awsConfig.BucketName,
            Key = keyName,
            ContentBody = "sample text",
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
        };

        var putResponse = await client.PutObjectAsync(putRequest);


    }
}
