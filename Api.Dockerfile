FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /

COPY /server/OMenteJovem.Api/Domain/*.csproj /server/Domain/
RUN dotnet restore /server/Domain/

COPY /server/OMenteJovem.Api/Api/*.csproj /server/Api/
RUN dotnet restore /server/Api/

COPY /server/OMenteJovem.Api/Domain /server/Domain
COPY /server/OMenteJovem.Api/Api /server/Api

RUN dotnet build /server/Api -c Release
RUN dotnet publish /server/Api -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT [ "dotnet", "Api.dll" ]