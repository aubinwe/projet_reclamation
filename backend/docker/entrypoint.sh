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

# 2. Audit des variables (DÉBOGAGE FINAL)
echo "🔍 Audit des variables d'environnement :"
printenv | grep -E '^(DB_|MYSQL)' | cut -d= -f1 | sort
printenv | grep -E '^(DB_|MYSQL)' | while read line; do
    key=$(echo $line | cut -d= -f1)
    value=$(echo $line | cut -d= -f2-)
    if [ -z "$value" ]; then
        echo "   ⚠️ $key est VIDE"
    else
        echo "   ✅ $key est PRÉSENT (Longueur: ${#value})"
    fi
done

# Déterminer les variables finales
FINAL_DB_HOST="${DB_HOST:-$MYSQLHOST}"
FINAL_DB_PORT="${DB_PORT:-$MYSQLPORT}"
FINAL_DB_DATABASE="${DB_DATABASE:-$MYSQLDATABASE}"
FINAL_DB_USER="${DB_USERNAME:-$MYSQLUSER}"
FINAL_DB_PASS="${DB_PASSWORD:-$MYSQLPASSWORD}"

echo "📝 Génération forcée du fichier .env..."
echo "   -> DB_HOST final: [$FINAL_DB_HOST]"

cat <<EOF > .env
APP_NAME=IBAM_Claims
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL}
DB_CONNECTION=mysql
DB_HOST=${FINAL_DB_HOST}
DB_PORT=${FINAL_DB_PORT:-3306}
DB_DATABASE=${FINAL_DB_DATABASE}
DB_USERNAME=${FINAL_DB_USER}
DB_PASSWORD=${FINAL_DB_PASS}
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

