FROM php:8.2-cli-alpine

# Install system dependencies and PostgreSQL PHP extension
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files for caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application files
COPY . .

# Complete composer autoload
RUN composer dump-autoload --optimize --no-dev

# Ensure storage and bootstrap/cache permissions
RUN chmod -R 775 storage bootstrap/cache

# Render and cloud platforms dynamically bind to $PORT
ENV PORT=8080
EXPOSE 8080

# Run migrations and start Laravel server
CMD php artisan config:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT}
