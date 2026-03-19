#!/bin/sh
set -e

echo "🚀 Démarrage du backend IBAM Réclamations..."

# Générer une clé applicative si absente
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY manquante, génération en cours..."
    php artisan key:generate --force
fi

# Générer dynamiquement le fichier .env à partir des variables Railway
# Cela garantit que Laravel voit bien les variables même si l'environnement système est capricieux
echo "📝 Génération du fichier .env..."
echo "APP_NAME=IBAM_Claims" > .env
env | grep -E '^(APP_|DB_|MAIL_|CACHE_|SESSION_|QUEUE_|VITE_|FRONTEND_)' >> .env

# Nettoyer les anciens caches pour forcer la relecture du nouveau .env
echo "🧹 Nettoyage du cache..."
php artisan config:clear
php artisan cache:clear

# Optimiser l'application pour la production
echo "⚙️  Optimisation Laravel..."
php artisan route:cache
php artisan view:cache

# Attendre que la base de données soit prête (optionnel en prod, Railway gère les dépendances)
echo "⏳ Tentative de migration de la base de données..."
php artisan migrate --force || echo "⚠️ Migration échouée ou déjà faite..."

echo "✅ Base de données accessible !"

# Exécuter les migrations (safe: ne recrée pas les tables existantes)
echo "🗃️  Exécution des migrations..."
php artisan migrate --force

echo "✅ Backend prêt ! Démarrage de Nginx + PHP-FPM..."

# Démarrer Supervisor (qui lance Nginx + PHP-FPM)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
