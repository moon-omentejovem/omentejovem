using System.ComponentModel.DataAnnotations;

namespace Domain.Services;

public class AWSConfig
{
    [Required]
    public string AccessKey { get; set; }

    [Required]
    public string SecretKey { get; set; }

    public string BucketName { get; set; }

    public string CloudFrontBaseUrl { get; set; }
}