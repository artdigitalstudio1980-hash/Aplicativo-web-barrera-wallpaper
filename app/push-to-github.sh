#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Git Push Helper - Barrera Wallpaper${NC}"
echo ""

# Verificar si hay cambios
if [[ -z $(git status -s) ]]; then
    echo -e "${RED}❌ No hay cambios para hacer commit${NC}"
    exit 0
fi

# Mostrar cambios
echo -e "${YELLOW}📝 Archivos modificados:${NC}"
git status -s
echo ""

# Pedir mensaje de commit
read -p "💬 Mensaje del commit: " commit_message

if [[ -z "$commit_message" ]]; then
    echo -e "${RED}❌ Mensaje de commit vacío. Abortando.${NC}"
    exit 1
fi

# Add all changes
echo -e "${YELLOW}➕ Agregando cambios...${NC}"
git add .

# Commit
echo -e "${YELLOW}💾 Creando commit...${NC}"
git commit -m "$commit_message"

# Push
echo -e "${YELLOW}🚀 Subiendo a GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ¡Cambios subidos exitosamente!${NC}"
    echo -e "${GREEN}🌐 Hostinger desplegará automáticamente en 5-10 minutos${NC}"
    echo -e "${GREEN}📊 Monitorea el deployment en: https://hpanel.hostinger.com${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al subir cambios${NC}"
    echo -e "${YELLOW}Verifica tu conexión a GitHub${NC}"
fi
