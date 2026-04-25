#!/bin/bash

# Script rápido para actualizar desde GitHub en Hostinger
# Uso: ./quick-update.sh

set -e

echo "🔄 Actualizando desde GitHub..."

# Pull latest changes
git pull origin main

echo "📦 Instalando dependencias..."
yarn install

echo "🔨 Regenerando Prisma Client..."
yarn prisma generate

echo "🏗️  Construyendo aplicación..."
yarn build

echo "🔄 Reiniciando PM2..."
pm2 restart barrera-wallpaper

echo "✅ ¡Actualización completada!"
pm2 logs barrera-wallpaper --lines 20
