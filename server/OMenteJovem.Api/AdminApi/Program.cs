using AdminApi.Components;
using AdminApi.Services;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Domain;
using Domain.Services;
using Domain.Utils;
using Moq;
using TinifyAPI;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddEnvironmentVariables("OMJ_ADMIN_");

// Add services to the container.
builder.Services
    .AddDomain()
    .AddS3Service(builder.Configuration)
    .AddSingleton<ListNftsService>()
    .AddSingleton<ListCollectionsService>()
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
