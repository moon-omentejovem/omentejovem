using Domain.Database;
using Domain.Utils;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
using System.Reflection;

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
}
