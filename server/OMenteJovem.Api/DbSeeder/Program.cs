using DbSeeder;
using DbSeeder.Objkt;
using Domain;
using Domain.OpenSea;
using Domain.Utils;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.Newtonsoft;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Polly;
using Polly.Retry;

using var host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((context, builder) =>
    {
        IConfiguration config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .AddJsonFile("appsettings.Development.json")
            .AddEnvironmentVariables("OMJ_DB_SEEDER_")
            .Build();

        builder.AddConfiguration(config);
    })
    .ConfigureServices((context, services) =>
    {
        services
            .AddConfiguration<OpenSeaConfig>("OpenSea")
            .AddConfiguration<ObjktConfig>("Objkt")
            .AddSingleton(resolver =>
            {
                var graphQLClient = new GraphQLHttpClient("https://data.objkt.com/v3/graphql", new NewtonsoftJsonSerializer());

                return graphQLClient;
            })
            .AddResiliencePipeline("httpPipeline", builder =>
            {
                builder
                    .AddRetry(new RetryStrategyOptions
                    {
                        MaxRetryAttempts = 6,
                        Delay = TimeSpan.FromSeconds(5)
                    });
            })
            .AddSingleton<ObjktClient>()
            .AddSingleton<OpenSeaClient>()
            .AddS3Service(context.Configuration)
            .AddDomain()
            .AddHostedService<Worker>();
    })
    .Build();

try
{
    host.Start();
}
catch
{
    return -1;
}

return 0;
