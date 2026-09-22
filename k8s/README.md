# Déploiement Kubernetes local

Ces manifestes déploient l'API, le frontend, PostgreSQL et un volume persistant dans le namespace `erpstock`.
Le déploiement local active également un jeu de données de démonstration (articles, stocks et mouvements). Pour un vrai environnement de production, passez `SeedDemoData__Enabled` à `"false"` dans `configmap.yaml`.

## Prérequis

- Docker Desktop avec Kubernetes activé, ou Minikube.
- `kubectl` connecté au cluster : `kubectl cluster-info` doit réussir.
- Un contrôleur NGINX Ingress si vous souhaitez utiliser `http://erpstock.local`.

## Construire les images pour Kubernetes

Depuis la racine du dépôt :

```powershell
docker build -t gestionstock-api:demo-data-v1 -f ERPStock.API/Dockerfile .
docker build --build-arg VITE_API_BASE_URL=/api -t gestionstock-frontend:k8s ERPStock.Frontend
```

Docker Desktop partage ses images locales avec son cluster Kubernetes. Avec Minikube, chargez-les après la construction :

```powershell
minikube image load gestionstock-api:demo-data-v1
minikube image load gestionstock-frontend:k8s
```

## Créer les secrets et déployer

```powershell
Copy-Item k8s/secret.example.yaml k8s/secret.yaml
```

Remplacez toutes les valeurs de `k8s/secret.yaml`, puis exécutez :

```powershell
kubectl apply -f k8s/secret.yaml
kubectl apply -k k8s
kubectl get pods -n erpstock -w
```

Attendez que les pods soient `Running` et `READY 1/1`.

## Vérifier l'application

Sans Ingress, ouvrez un tunnel local vers le frontend :

```powershell
kubectl port-forward -n erpstock service/frontend 8080:80
```

Puis ouvrez `http://localhost:8080`. Le frontend transmet les appels `/api` vers le service API interne.

Avec NGINX Ingress installé, ajoutez dans le fichier Windows `C:\Windows\System32\drivers\etc\hosts` :

```text
127.0.0.1 erpstock.local
```

Ouvrez ensuite `http://erpstock.local`.

Pour vérifier l'API directement :

```powershell
kubectl port-forward -n erpstock service/api 8081:8080
Invoke-WebRequest http://localhost:8081/health
```

## Commandes utiles

```powershell
kubectl get all -n erpstock
kubectl logs -n erpstock deployment/api -f
kubectl describe pod -n erpstock <nom-du-pod>
kubectl delete -k k8s
```

`kubectl delete -k k8s` ne supprime pas le fichier de secrets ni le volume persistant. Pour supprimer les données PostgreSQL locales, supprimez explicitement le PVC après avoir vérifié son nom avec `kubectl get pvc -n erpstock`.
