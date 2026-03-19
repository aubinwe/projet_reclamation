# =====================================================
# STAGE 1 : Installation des dépendances PHP
# =====================================================
FROM php:8.4-fpm AS vendor

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev

# Installer les extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip exif pcntl

# Copier Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier les fichiers composer
COPY composer.json composer.lock ./

# Installer les dépendances en ignorant la vérification de version PHP 
# car on SAIT qu'on est en 8.4 dans ce Dockerfile
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --no-interaction \
    --prefer-dist \
    --ignore-platform-req=php

# Copier le reste du code
COPY . .

# Générer l'autoloader
RUN composer dump-autoload --optimize --no-dev --ignore-platform-req=php

# =====================================================
# STAGE 2 : Image de production finale
# =====================================================
FROM php:8.4-fpm AS production

WORKDIR /var/www

# Installer Nginx et les dépendances système minimum
RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev \
    supervisor \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Installer les extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip exif pcntl

# Copier la configuration Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copier PHP-FPM configuration
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Copier la configuration Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copier le code + vendor depuis le stage 1
COPY --from=vendor /app /var/www

# Créer les répertoires nécessaires à Laravel et le fichier .env vide
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && touch .env \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Copier le script de démarrage
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Railway expose le port via la variable PORT (défaut 8080)
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
