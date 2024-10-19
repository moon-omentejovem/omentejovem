using Domain;
using Domain.OpenSea;
using Domain.Utils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .AddDomain()
    .AddS3Service(builder.Configuration)
    .AddResiliencePipeline()
    .AddConfiguration<OpenSeaConfig>("OpenSea")
    .AddSingleton<OpenSeaClient>()
    ;
builder.Services.AddLogging();

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.Development.json", optional: true)
    .AddEnvironmentVariables("OMJ_API_");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    
}

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();

//app.UseAuthorization();

app.UseRouting();
app.MapControllers();

app.Run();