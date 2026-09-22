# ERPStock

ERP de gestion de stock conteneurisé avec React/Vite, ASP.NET Core 9 et PostgreSQL 16.

## Architecture

- `frontend` : interface React servie par Nginx, accessible sur `http://localhost:5173`.
- `api` : API ASP.NET Core, accessible sur `http://localhost:5083`, avec une sonde Docker sur `/health`.
- `postgres` : base PostgreSQL persistée dans le volume Docker `postgres_data`.

## Lancer la version conteneurisée

1. Installez Docker Desktop puis créez votre fichier de secrets local :

   ```powershell
   Copy-Item .env.example .env
   ```

2. Remplacez chaque valeur de `.env` par une valeur forte. La clé JWT doit faire au moins 32 caractères.

3. Construisez et démarrez les services :

   ```powershell
   docker compose up --build
   ```

4. Vérifiez les services :

   ```powershell
   docker compose ps
   Invoke-WebRequest http://localhost:5083/health
   ```

Le frontend est disponible sur `http://localhost:5173`. Pour arrêter les services, utilisez `docker compose down`. Ajoutez `--volumes` seulement si vous voulez aussi supprimer les données PostgreSQL locales.

## Mode développement (rechargement à chaud)

Le fichier `docker-compose.dev.yml` remplace les images de production par les cibles de développement et monte le code source :

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Les changements dans l'API et le frontend sont alors rechargés automatiquement. Les URLs restent `http://localhost:5083` pour l'API et `http://localhost:5173` pour le frontend. Arrêtez avec `Ctrl+C`, puis `docker compose -f docker-compose.yml -f docker-compose.dev.yml down`.

## Contrôles de qualité

Avant un commit :

```powershell
dotnet test ERPStock.sln --configuration Release
Set-Location ERPStock.Frontend
npm ci
npm run lint
npm run build
```

La CI GitHub Actions exécute ces contrôles, construit les deux images Docker et analyse l'image API avec Trivy à chaque pull request et chaque push vers `main`.

## Sécurité de la configuration

Les secrets ne doivent jamais être commités. `.env` et les fichiers `appsettings.*.json` dédiés aux environnements locaux sont ignorés par Git. Si des secrets ont déjà été poussés, régénérez-les immédiatement : les retirer du fichier ne les efface pas de l'historique Git.
