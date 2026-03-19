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

# Debug: Lister les variables d'environnement disponibles (seulement les noms pour la sécurité)
echo "🔍 Variables d'environnement détectées (clés uniquement) :"
env | cut -d= -f1 | sort

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données (Host: $DB_HOST)..."
if [ -z "$DB_HOST" ]; then
    echo "❌ Erreur: DB_HOST n'est pas défini dans les variables d'environnement."
    exit 1
fi

until php -r "
    try {
        \$pdo = new PDO(
            'mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: 3306),
            getenv('DB_USERNAME'),
            getenv('DB_PASSWORD'),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        exit(0);
    } catch (Exception \$e) {
        exit(1);
    }
"; do
    echo "   DB ($DB_HOST) pas encore prête, nouvelle tentative dans 5s..."
    sleep 5
done

echo "✅ Base de données accessible !"

# Exécuter les migrations (safe: ne recrée pas les tables existantes)
echo "🗃️  Exécution des migrations..."
php artisan migrate --force

echo "✅ Backend prêt ! Démarrage de Nginx + PHP-FPM..."

# Démarrer Supervisor (qui lance Nginx + PHP-FPM)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
