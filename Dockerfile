# ==========================================
# STAGE 1: Build Frontend Assets (Vite/React)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: PHP-FPM Backend Application
# ==========================================
FROM php:8.3-fpm-alpine

# Install System Dependencies & Extension PHP yang Dibutuhkan (SQLite & PDO)
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite-dev \
    oniguruma-dev

RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd

# Copy Composer dari Official Image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy Source Code Aplikasi
COPY . .

# Copy Hasil Build Frontend dari Stage 1 ke public/build
COPY --from=frontend-builder /app/public/build ./public/build

# Install Dependency PHP (Optimized for Production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Setup File Database SQLite & Perizinan Storage
RUN touch /var/www/database/database.sqlite \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database

EXPOSE 9000

CMD ["php-fpm"]