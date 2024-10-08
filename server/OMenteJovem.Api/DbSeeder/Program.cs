using DbSeeder;
using DbSeeder.Objkt;
using Domain;
using Domain.OpenSea;
using Domain.Utils;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.Newtonsoft;
using Polly;
using Polly.Retry;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile("appsettings.Development.json")
    .AddEnvironmentVariables("OMJ_DB_SEEDER_");

builder.Services
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
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromSeconds(3)
            });
    })
    .AddSingleton<ObjktClient>()
    .AddSingleton<OpenSeaClient>()
    .AddS3Service(builder.Configuration)
    .AddDomain();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();

host.Run();