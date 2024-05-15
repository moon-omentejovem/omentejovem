using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Domain.Utils;

public static class ConfigurationHelper
{
    public static IServiceCollection AddConfiguration<TConfiguration>(this IServiceCollection services, string configSectionPath) where TConfiguration : class
    {
        services.AddOptions<TConfiguration>()
            .BindConfiguration(configSectionPath)
            .ValidateOnStart();

        services.AddSingleton((IServiceProvider resolver) => resolver.GetRequiredService<IOptions<TConfiguration>>().Value);

        return services;
    }
}