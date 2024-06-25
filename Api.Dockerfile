FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

COPY /server/OMenteJovem.Api/Domain/*.csproj ./Domain/
RUN dotnet restore ./Domain/

COPY /server/OMenteJovem.Api/Api/*.csproj ./Api/
RUN dotnet restore ./Api/

COPY /server/OMenteJovem.Api/Domain ./Domain
COPY /server/OMenteJovem.Api/Api ./Api

RUN dotnet publish ./Api -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 80

ENTRYPOINT [ "dotnet", "Api.dll" ]