#!/bin/bash

# Script para configurar E2E tests con Synpress
# Ejecutar desde el directorio web/

set -e  # Exit on error

echo "🚀 Configurando E2E tests con Synpress..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Instalar Playwright browsers
echo -e "${YELLOW}📦 Paso 1: Instalando navegadores de Playwright...${NC}"
npx playwright install chromium --with-deps
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Playwright instalado correctamente${NC}"
else
    echo -e "${RED}❌ Error instalando Playwright${NC}"
    exit 1
fi
echo ""

# Paso 2: Instalar Playwright en Synpress cache
echo -e "${YELLOW}📦 Paso 2: Instalando Playwright para Synpress...${NC}"
cd node_modules/@synthetixio/synpress/node_modules/@synthetixio/synpress-cache
npx playwright install chromium
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Playwright para Synpress instalado${NC}"
else
    echo -e "${RED}⚠️  Advertencia: No se pudo instalar en Synpress (puede que no sea necesario)${NC}"
fi
cd ../../../../..
echo ""

# Paso 3: Limpiar cache anterior si existe
echo -e "${YELLOW}🧹 Paso 3: Limpiando cache anterior...${NC}"
if [ -d ".cache-synpress" ]; then
    rm -rf .cache-synpress
    echo -e "${GREEN}✅ Cache anterior eliminado${NC}"
else
    echo -e "${GREEN}✅ No hay cache anterior${NC}"
fi
echo ""

# Paso 4: Crear caches de wallets
echo -e "${YELLOW}🔐 Paso 4: Creando caches de wallets...${NC}"
echo "Esto abrirá 5 ventanas de navegador (una por cada wallet)"
echo "Espera a que todas completen..."
echo ""
npx synpress e2e/wallet-setup --debug
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Caches de wallets creados exitosamente${NC}"
    echo ""
    echo "Archivos creados en .cache-synpress/:"
    ls -la .cache-synpress/ | grep "^d" | grep -v "^d.*\.$"
else
    echo -e "${RED}❌ Error creando caches de wallets${NC}"
    echo ""
    echo "Si el error persiste:"
    echo "1. Verifica que Anvil esté corriendo: lsof -i :8545"
    echo "2. Lee README_E2E_TESTS.md para enfoques alternativos"
    exit 1
fi
echo ""

# Paso 5: Verificar instalación
echo -e "${YELLOW}🔍 Paso 5: Verificando instalación...${NC}"
if [ -d ".cache-synpress" ]; then
    CACHE_COUNT=$(ls -d .cache-synpress/*/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CACHE_COUNT" -ge "5" ]; then
        echo -e "${GREEN}✅ Los 5 caches de wallets fueron creados${NC}"
        echo ""
        echo -e "${GREEN}🎉 ¡Configuración completada exitosamente!${NC}"
        echo ""
        echo "Ahora puedes ejecutar los tests E2E:"
        echo "  npm run test:e2e:flow         # Test completo"
        echo "  npm run test:e2e:flow:headed  # Con interfaz visual"
    else
        echo -e "${YELLOW}⚠️  Solo se crearon $CACHE_COUNT caches (se esperaban 5)${NC}"
        echo "Intenta ejecutar nuevamente: npx synpress e2e/wallet-setup --debug --force"
    fi
else
    echo -e "${RED}❌ No se creó el directorio .cache-synpress${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Setup completado${NC}"
