#!/bin/sh
set -e

echo "🚀 Démarrage du backend IBAM Réclamations..."

# Générer une clé applicative si absente
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY manquante, génération en cours..."
    php artisan key:generate --force
fi

# Optimiser l'application pour la production
echo "⚙️  Optimisation Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
until php artisan db:check 2>/dev/null || php -r "
    \$pdo = new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: 3306),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    echo 'ok';
" 2>/dev/null; do
    echo "   DB pas encore prête, nouvelle tentative dans 3s..."
    sleep 3
done

echo "✅ Base de données accessible !"

# Exécuter les migrations (safe: ne recrée pas les tables existantes)
echo "🗃️  Exécution des migrations..."
php artisan migrate --force

echo "✅ Backend prêt ! Démarrage de Nginx + PHP-FPM..."

# Démarrer Supervisor (qui lance Nginx + PHP-FPM)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
