#!/bin/bash

# Script post-creación del devcontainer
# Se ejecuta después de crear el container

echo "🚀 Configurando entorno de desarrollo Toyota Events..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

# Configurar Git si no está configurado
if [ -z "$(git config --global user.name)" ]; then
    print_info "Configurando Git con valores por defecto..."
    git config --global user.name "Toyota Developer"
    git config --global user.email "developer@toyota.com"
    print_warning "Recuerda configurar tu nombre y email de Git con:"
    echo "  git config --global user.name 'Tu Nombre'"
    echo "  git config --global user.email 'tu.email@toyota.com'"
fi

# Verificar versión de Node.js
print_info "Verificando versión de Node.js..."
node_version=$(node --version)
print_status "Node.js version: $node_version"

# Verificar versión de npm
npm_version=$(npm --version)
print_status "npm version: $npm_version"

# Instalar dependencias del proyecto
print_info "Instalando dependencias del proyecto..."
if npm install; then
    print_status "Dependencias instaladas correctamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

# Verificar Azure CLI
print_info "Verificando Azure CLI..."
if command -v az &> /dev/null; then
    az_version=$(az --version 2>/dev/null | head -n 1 || echo "Azure CLI instalado via features")
    print_status "Azure CLI disponible"
else
    print_warning "Azure CLI se instalará via devcontainer features"
fi

# Docker CLI será instalado via features
print_info "Docker CLI se instalará via devcontainer features"

# GitLab CLI - será instalado después si es necesario
print_info "Para instalar GitLab CLI manualmente:"
echo "curl -fsSL https://gitlab.com/gitlab-org/cli/-/releases/latest/download/glab_linux_amd64.tar.gz | sudo tar -xz -C /usr/local/bin glab"

# Crear archivos de configuración local si no existen
print_info "Configurando archivos locales..."

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Configuración local para desarrollo
NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Toyota Events CMS

# Azure (usar variables del container)
# AZURE_TENANT_ID se toma de la variable de entorno
# AZURE_SUBSCRIPTION_ID se toma de la variable de entorno
EOF
    print_status "Creado archivo .env.local"
fi

# Crear .vscode/launch.json si no existe
mkdir -p .vscode
if [ ! -f ".vscode/launch.json" ]; then
    cat > .vscode/launch.json << EOF
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch React App",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/node_modules/.bin/vite",
            "args": ["dev"],
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development"
            }
        },
        {
            "name": "Launch Express Server",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/server.js",
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development"
            }
        },
        {
            "name": "Attach to Chrome",
            "type": "chrome",
            "request": "attach",
            "port": 9222,
            "url": "http://localhost:5173",
            "webRoot": "\${workspaceFolder}/src"
        }
    ]
}
EOF
    print_status "Creado archivo .vscode/launch.json"
fi

# Crear .vscode/tasks.json si no existe
if [ ! -f ".vscode/tasks.json" ]; then
    cat > .vscode/tasks.json << EOF
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "dev: Start Vite Dev Server",
            "type": "shell",
            "command": "npm run dev",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "isBackground": true,
            "problemMatcher": []
        },
        {
            "label": "build: Build for Production",
            "type": "shell",
            "command": "npm run build",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "lint: Run ESLint",
            "type": "shell",
            "command": "npm run lint",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "preview: Preview Build",
            "type": "shell",
            "command": "npm run preview",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "isBackground": true
        },
        {
            "label": "Azure: Get Publish Profile",
            "type": "shell",
            "command": "./setup-azure.ps1",
            "options": {
                "shell": {
                    "executable": "pwsh",
                    "args": ["-Command"]
                }
            },
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": true,
                "panel": "shared"
            }
        }
    ]
}
EOF
    print_status "Creado archivo .vscode/tasks.json"
fi

# Verificar estructura del proyecto
print_info "Verificando estructura del proyecto..."
required_files=("package.json" "vite.config.js" "server.js" "web.config" "iisnode.yml")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "✓ $file"
    else
        print_warning "⚠ $file no encontrado"
    fi
done

# Crear scripts de desarrollo útiles
print_info "Creando scripts de desarrollo..."

# Script para desarrollo completo
cat > dev-start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando entorno de desarrollo Toyota Events..."
echo "📦 Instalando dependencias..."
npm install
echo "🎯 Iniciando servidor de desarrollo..."
npm run dev
EOF
chmod +x dev-start.sh

# Script para build y preview
cat > build-and-preview.sh << 'EOF'
#!/bin/bash
echo "🏗️ Construyendo aplicación..."
npm run build
echo "👀 Iniciando preview..."
npm run preview
EOF
chmod +x build-and-preview.sh

print_status "Scripts de desarrollo creados"

# Mostrar información útil
print_info "🎉 Configuración completada!"
echo ""
echo -e "${BLUE}📋 Información del entorno:${NC}"
echo "  • Node.js: $node_version"
echo "  • npm: $npm_version"
echo "  • Workspace: /workspace"
echo ""
echo -e "${BLUE}🚀 Comandos útiles:${NC}"
echo "  • npm run dev          - Iniciar servidor de desarrollo"
echo "  • npm run build        - Construir para producción"
echo "  • npm run preview      - Preview de build"
echo "  • npm run lint         - Ejecutar linter"
echo "  • ./dev-start.sh       - Script completo de desarrollo"
echo "  • ./build-and-preview.sh - Build y preview"
echo ""
echo -e "${BLUE}🔗 URLs locales:${NC}"
echo "  • Vite Dev: http://localhost:5173"
echo "  • Express: http://localhost:3000"
echo "  • Preview: http://localhost:4173"
echo ""
echo -e "${BLUE}☁️ Azure:${NC}"
echo "  • App Service: $AZURE_WEBAPP_NAME"
echo "  • Resource Group: $AZURE_RESOURCE_GROUP"
echo "  • URL: https://$AZURE_WEBAPP_NAME.azurewebsites.net"
echo ""
echo -e "${GREEN}✅ ¡Listo para desarrollar!${NC}"
