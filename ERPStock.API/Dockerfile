# Étape 1 : Build - compile le projet avec le SDK complet
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ERPStock.API/ERPStock.API.csproj", "ERPStock.API/"]
COPY ["ERPStock.Application/ERPStock.Application.csproj", "ERPStock.Application/"]
COPY ["ERPStock.Domain/ERPStock.Domain.csproj", "ERPStock.Domain/"]
COPY ["ERPStock.Infrastructure/ERPStock.Infrastructure.csproj", "ERPStock.Infrastructure/"]

RUN dotnet restore "ERPStock.API/ERPStock.API.csproj"

COPY . .

WORKDIR /src/ERPStock.API
RUN dotnet build "ERPStock.API.csproj" -c Release -o /app/build

# Étape 2 : Publish - prépare les fichiers finaux optimisés
FROM build AS publish
RUN dotnet publish "ERPStock.API.csproj" -c Release -o /app/publish

# Étape 3 : Runtime - image finale, légère, sans le SDK
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "ERPStock.API.dll"]