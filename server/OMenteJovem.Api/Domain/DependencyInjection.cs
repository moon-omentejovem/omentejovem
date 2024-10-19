using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Domain.Database;
using Domain.OpenSea;
using Domain.Services;
using Domain.Utils;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
using Polly;
using Polly.Retry;
using System.Reflection;
using TinifyAPI;

namespace Domain;

public static class DependencyInjection
{
    public static IServiceCollection AddDomain(this IServiceCollection services)
    {
        services.AddConfiguration<MongoDbConfig>("MongoDb");

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        services.AddSingleton<IMongoDatabase>(resolver =>
        {
            var config = resolver.GetRequiredService<MongoDbConfig>();

            var clientSettings = new MongoClientSettings()
            {
                Scheme = ConnectionStringScheme.MongoDB,
                Server = new MongoServerAddress("localhost"),
            };

            var client = new MongoClient(
                config.ConnectionString
            );

            return client.GetDatabase(config.DatabaseName);
        });

        return services;
    }

    public static IServiceCollection AddS3Service(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddConfiguration<AWSConfig>("AWS");

        services
            .AddSingleton<IAmazonS3>((resolver) =>
            {
                var credentials = resolver.GetRequiredService<AWSConfig>();

                return new AmazonS3Client(new BasicAWSCredentials(credentials.AccessKey, credentials.SecretKey), RegionEndpoint.SAEast1);
            });

        services
            .AddSingleton<S3UploadService>()
            .AddSingleton<UploadImagesService>();

        Tinify.Key = configuration.GetValue<string>("TinifyKey");

        return services;
    }

    public static IServiceCollection AddResiliencePipeline(this IServiceCollection services)
    {
        return services.AddResiliencePipeline("httpPipeline", builder =>
         {
             builder
                 .AddRetry(new RetryStrategyOptions
                 {
                     MaxRetryAttempts = 3,
                     Delay = TimeSpan.FromSeconds(3),
                     ShouldHandle = new PredicateBuilder().Handle<MappingException>()
                 });
         });
    }
}
