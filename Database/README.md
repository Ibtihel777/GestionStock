# Base de données

Le schéma de la base de données est piloté par les migrations Entity Framework Core existantes. Elles constituent la source de vérité pour toute évolution de la structure de la base.

Un export lisible du schéma, `schema.sql`, sera conservé dans ce dossier à titre de référence. Depuis le projet `ERPStock.Infrastructure`, générez-le avec la commande suivante :

```powershell
Script-Migration -Output "../Database/schema.sql"
```

Ne modifiez jamais `schema.sql` manuellement : régénérez-le toujours à partir des migrations.

Les données de démonstration sont déjà gérées automatiquement par le seeder existant au démarrage de l'application en environnement `Development`. Aucun fichier de seed séparé n'est donc nécessaire.
