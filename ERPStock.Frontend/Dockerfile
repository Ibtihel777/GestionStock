# Étape 1 : Build
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force && npm install

COPY . .
RUN npm run build

# Étape 2 : Servir avec nginx (léger et rapide)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]