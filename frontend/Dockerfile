# =====================================================
# STAGE 1 : Build de l'application React/Vite
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances d'abord (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copier le reste du code source
COPY . .

# Build arg : URL de l'API backend (fourni au build Railway)
# Ex: https://mon-backend.up.railway.app/api
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construire l'application pour la production
RUN npm run build

# =====================================================
# STAGE 2 : Serveur Nginx pour les fichiers statiques
# =====================================================
FROM nginx:alpine AS production

# Supprimer la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration Nginx optimisée
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Railway expose le port 8080 par défaut
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
