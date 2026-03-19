# =====================================================
# STAGE 1 : Installation des dépendances PHP
# =====================================================
FROM php:8.2-fpm-alpine AS vendor

WORKDIR /app

# Installer les dépendances système nécessaires à composer
RUN apk add --no-cache \
    git \
    unzip \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev

# Installer les extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip exif pcntl

# Copier Composer depuis son image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier uniquement les fichiers nécessaires à composer
COPY composer.json composer.lock ./

# Installer les dépendances sans les dev-dependencies
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --no-interaction \
    --prefer-dist

# Copier tout le code source
COPY . .

# Générer l'autoloader optimisé
RUN composer dump-autoload --optimize --no-dev

# =====================================================
# STAGE 2 : Image de production finale
# =====================================================
FROM php:8.2-fpm-alpine AS production

WORKDIR /var/www

# Installer Nginx et les dépendances système minimum
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev \
    supervisor

# Installer les extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip exif pcntl

# Copier la configuration Nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copier PHP-FPM configuration
COPY docker/php-fpm.conf /etc/php82/php-fpm.d/www.conf

# Copier la configuration Supervisor (gère Nginx + PHP-FPM ensemble)
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copier le code + vendor depuis le stage 1
COPY --from=vendor /app /var/www

# Créer les répertoires nécessaires à Laravel
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Copier le script de démarrage
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Railway expose le port via la variable PORT (défaut 8080)
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
