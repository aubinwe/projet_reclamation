#!/bin/sh
set -e

echo "🚀 Démarrage du backend IBAM Réclamations..."

# Générer une clé applicative si absente
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY manquante, génération en cours..."
    php artisan key:generate --force
fi

# 1. Supprimer manuellement les fichiers de cache (NE PAS UTILISER ARTISAN ICI)
echo "🧹 Nettoyage manuel du cache..."
rm -f bootstrap/cache/config.php bootstrap/cache/services.php bootstrap/cache/packages.php bootstrap/cache/routes.php

# 2. Générer dynamiquement le fichier .env de manière TRÈS explicite
echo "📝 Génération forcée du fichier .env..."
cat <<EOF > .env
APP_NAME=IBAM_Claims
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL}
DB_CONNECTION=mysql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
CACHE_STORE=file
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
FRONTEND_URL=${FRONTEND_URL}
EOF

# 3. Réparer les permissions (car on est en root dans l'entrypoint)
chown www-data:www-data .env

# 4. Exécuter les migrations (on laisse Laravel gérer la connexion maintenant)
echo "⏳ Tentative de migration de la base de données..."
php artisan migrate --force --no-interaction || echo "⚠️ Migration ignorée (DB peut-être pas encore prête)."

# 5. Optimiser (seulement si le .env est prêt)
echo "⚙️  Optimisation finale..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Backend prêt ! Démarrage de Nginx + PHP-FPM..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

