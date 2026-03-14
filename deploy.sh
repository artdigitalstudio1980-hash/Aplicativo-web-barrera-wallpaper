#!/bin/bash

# Script de Deployment para Hostinger
# Ejecutar este script en el servidor de Hostinger despues de hacer git pull

set -e  # Detener en caso de error

echo "🚀 Iniciando deployment de Barrera Wallpaper..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encuentra package.json${NC}"
    echo -e "${YELLOW}Asegurate de estar en el directorio /app${NC}"
    exit 1
fi

# Verificar variables de entorno críticas
echo -e "${YELLOW}🔍 Verificando variables de entorno...${NC}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ Error: NEXTAUTH_SECRET no está configurada${NC}"
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo -e "${RED}❌ Error: NEXTAUTH_URL no está configurada${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
yarn install --frozen-lockfile || {
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Generar Prisma Client
echo -e "${YELLOW}🔨 Generando Prisma Client...${NC}"
yarn prisma generate || {
    echo -e "${RED}❌ Error generando Prisma Client${NC}"
    exit 1
}
echo -e "${GREEN}✅ Prisma Client generado${NC}"

# Ejecutar migraciones de base de datos
echo -e "${YELLOW}🗄️  Ejecutando migraciones de base de datos...${NC}"
yarn prisma migrate deploy || {
    echo -e "${RED}❌ Error ejecutando migraciones${NC}"
    exit 1
}
echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"

# Construir la aplicación
echo -e "${YELLOW}🏗️  Construyendo aplicación...${NC}"
yarn build || {
    echo -e "${RED}❌ Error construyendo aplicación${NC}"
    exit 1
}
echo -e "${GREEN}✅ Aplicación construida${NC}"

# Reiniciar PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación con PM2...${NC}"

if pm2 describe barrera-wallpaper > /dev/null 2>&1; then
    # La aplicación ya existe, reiniciarla
    pm2 restart barrera-wallpaper || {
        echo -e "${RED}❌ Error reiniciando aplicación${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Aplicación reiniciada${NC}"
else
    # Primera vez, iniciar la aplicación
    pm2 start yarn --name barrera-wallpaper -- start || {
        echo -e "${RED}❌ Error iniciando aplicación${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Aplicación iniciada${NC}"
fi

# Guardar configuración de PM2
pm2 save

echo -e "${GREEN}🎉 ¡Deployment completado exitosamente!${NC}"
echo -e "${YELLOW}📊 Ver logs: pm2 logs barrera-wallpaper${NC}"
echo -e "${YELLOW}📈 Ver estado: pm2 status${NC}"
