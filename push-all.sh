#!/bin/bash

# Script para automatizar push a múltiples repositorios
# Uso: ./push-all.sh [mensaje-commit]

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Automatizando Git Push a múltiples repositorios${NC}"
echo ""

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: No estás en un repositorio Git${NC}"
    exit 1
fi

# Verificar si hay cambios sin commitear
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    if [ -n "$1" ]; then
        echo -e "${YELLOW}📝 Commiteando cambios...${NC}"
        git add .
        git commit -m "$1"
        echo -e "${GREEN}✅ Cambios commiteados${NC}"
    else
        echo -e "${RED}❌ Hay cambios sin commitear. Usa: ./push-all.sh 'mensaje commit'${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Working tree limpio, procediendo con push...${NC}"
fi

# Función para push con manejo de errores
push_to_remote() {
    local remote=$1
    local remote_name=$2
    
    echo -e "${BLUE}📤 Pushing to ${remote_name}...${NC}"
    
    if git push $remote main; then
        echo -e "${GREEN}✅ ${remote_name} actualizado exitosamente!${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al actualizar ${remote_name}${NC}"
        return 1
    fi
}

# Array de remotes
declare -A remotes=(
    ["origin"]="GitLab"
    ["github"]="GitHub"
)

# Variables para tracking
success_count=0
total_count=${#remotes[@]}
failed_remotes=()

echo -e "${YELLOW}🔄 Iniciando push a ${total_count} repositorios...${NC}"
echo ""

# Push a cada remote
for remote in "${!remotes[@]}"; do
    if git remote | grep -q "^${remote}$"; then
        if push_to_remote "$remote" "${remotes[$remote]}"; then
            ((success_count++))
        else
            failed_remotes+=("${remotes[$remote]}")
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  Remote '${remote}' no configurado, saltando...${NC}"
        echo ""
    fi
done

# Resumen final
echo "================================================"
if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 ¡Todos los repositorios sincronizados exitosamente!${NC}"
    echo -e "${GREEN}📊 ${success_count}/${total_count} repositorios actualizados${NC}"
else
    echo -e "${YELLOW}⚠️  Sincronización parcial completada${NC}"
    echo -e "${YELLOW}📊 ${success_count}/${total_count} repositorios actualizados${NC}"
    
    if [ ${#failed_remotes[@]} -gt 0 ]; then
        echo -e "${RED}❌ Fallos en: ${failed_remotes[*]}${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🌐 URLs de los repositorios:${NC}"
echo -e "${BLUE}   • GitLab: https://gitlab.com/davidop/toyo0025-frontreact${NC}"
echo -e "${BLUE}   • GitHub: https://github.com/davidop/toyo0025-frontreact${NC}"
echo ""

exit 0
