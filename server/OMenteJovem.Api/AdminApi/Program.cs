using AdminApi.Components;
using AdminApi.Services;
using Amazon.Runtime;
using Amazon.S3;
using Domain;
using Domain.Utils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services
    .AddDomain()
    .AddConfiguration<AWSConfig>("AWS")
    .AddScoped<IAmazonS3>(resolver =>
    {
        var config = resolver.GetRequiredService<AWSConfig>();

        return new AmazonS3Client(new BasicAWSCredentials(config.AccessKey, config.SecretKey));
    })
    .AddSingleton<ListNftsService>()
    .AddRazorComponents()
    .AddInteractiveServerComponents();

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
