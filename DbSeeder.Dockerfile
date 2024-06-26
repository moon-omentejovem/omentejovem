FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

COPY /server/OMenteJovem.Api/Domain/*.csproj ./Domain/
RUN dotnet restore ./Domain/

COPY /server/OMenteJovem.Api/DbSeeder/*.csproj ./DbSeeder/
RUN dotnet restore ./DbSeeder/

COPY /server/OMenteJovem.Api/Domain ./Domain
COPY /server/OMenteJovem.Api/DbSeeder ./DbSeeder

RUN dotnet publish ./DbSeeder -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8000

ENTRYPOINT [ "dotnet", "DbSeeder.dll" ]