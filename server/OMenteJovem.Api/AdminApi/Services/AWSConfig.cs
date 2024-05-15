using System.ComponentModel.DataAnnotations;

namespace AdminApi.Services;

public class AWSConfig
{
    [Required]
    public string AccessKey { get; set; }

    [Required]
    public string SecretKey { get; set; }

    public string BucketName { get; set; }
}