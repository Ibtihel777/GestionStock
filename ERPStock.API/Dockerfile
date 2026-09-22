# Étape 1 : Build - compile le projet avec le SDK complet (nécessaire pour dotnet restore/build)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ERPStock.API/ERPStock.API.csproj", "ERPStock.API/"]
COPY ["ERPStock.Application/ERPStock.Application.csproj", "ERPStock.Application/"]
COPY ["ERPStock.Domain/ERPStock.Domain.csproj", "ERPStock.Domain/"]
COPY ["ERPStock.Infrastructure/ERPStock.Infrastructure.csproj", "ERPStock.Infrastructure/"]
COPY ["ERPStock.HealthCheck/ERPStock.HealthCheck.csproj", "ERPStock.HealthCheck/"]

RUN dotnet restore "ERPStock.API/ERPStock.API.csproj"
RUN dotnet restore "ERPStock.HealthCheck/ERPStock.HealthCheck.csproj"

COPY . .

WORKDIR /src/ERPStock.API
RUN dotnet build "ERPStock.API.csproj" -c Release -o /app/build

# Étape optionnelle : développement avec rechargement à chaud.
FROM build AS development
EXPOSE 8080
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://+:8080"]

# Étape 2 : Publish
FROM build AS publish
RUN dotnet publish "ERPStock.API.csproj" -c Release -o /app/publish --no-restore
WORKDIR /src/ERPStock.HealthCheck
RUN dotnet publish "ERPStock.HealthCheck.csproj" -c Release -o /app/healthcheck --no-restore

# Étape 3 : Runtime "chiseled" - minimal, sans shell, non-root intégré par défaut
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble-chiseled AS final
WORKDIR /app

COPY --from=publish /app/publish .
COPY --from=publish /app/healthcheck .

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["dotnet", "ERPStock.HealthCheck.dll"]
ENTRYPOINT ["dotnet", "ERPStock.API.dll"]
