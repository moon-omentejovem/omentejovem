using AdminApi.Components;
using AdminApi.Services;
using Domain;
using Domain.OpenSea;
using Domain.Utils;
using Polly;
using Polly.Retry;
using TinifyAPI;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddEnvironmentVariables("OMJ_ADMIN_");

// Add services to the container.
builder.Services
    .AddConfiguration<OpenSeaConfig>("OpenSea")
    .AddDomain()
    .AddS3Service(builder.Configuration)
    .AddSingleton<ListNftsService>()
    .AddSingleton<ListCollectionsService>()
    .AddSingleton<HomeCollectionService>()
    .AddResiliencePipeline("httpPipeline", builder =>
    {
        builder
            .AddRetry(new RetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromSeconds(3)
            });
    })
    .AddSingleton<OpenSeaClient>()
    .AddRazorComponents()
    .AddInteractiveServerComponents();

Tinify.Key = builder.Configuration.GetValue<string>("TinifyKey");

builder.Services.AddBlazorBootstrap();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
