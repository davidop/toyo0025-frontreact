# DevContainer - Toyota Events Development Environment

Este devcontainer proporciona un entorno de desarrollo completo y consistente para el proyecto Toyota Events Management System.

## 🚀 Características del DevContainer

### Herramientas Incluidas
- **Node.js 18** - Runtime de JavaScript
- **Azure CLI** - Gestión de recursos Azure
- **Docker CLI** - Containerización y deployment
- **GitLab CLI (glab)** - Integración con GitLab
- **VS Code Extensions** - Extensiones preconfiguradas para React/Azure

### Extensiones de VS Code Preinstaladas

#### React y JavaScript
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Path Intellisense
- Styled Components

#### Linting y Formatting
- ESLint
- Prettier
- JSON Language Support

#### Git y GitLab
- GitLens
- Git Graph
- GitLab Workflow

#### Azure y Cloud
- Azure Account
- Azure App Service
- Azure CLI Tools
- Azure Resource Groups

#### Productividad
- Thunder Client (REST client)
- TODO Highlight
- TODO Tree
- Live Share
- Markdown All in One

## 🏁 Comenzar

### 1. Requisitos Previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### 2. Abrir en DevContainer
1. Clona el repositorio
2. Abre VS Code
3. Presiona `F1` → "Dev Containers: Open Folder in Container"
4. Selecciona la carpeta del proyecto
5. VS Code construirá y abrirá el container automáticamente

### 3. Primera Configuración
El script `post-create.sh` se ejecutará automáticamente y:
- Instalará dependencias npm
- Configurará Git (si es necesario)
- Creará archivos de configuración locales
- Verificará herramientas disponibles

## 📁 Estructura del DevContainer

```
.devcontainer/
├── devcontainer.json    # Configuración principal del devcontainer
├── docker-compose.yml   # Definición de servicios Docker
├── Dockerfile          # Imagen custom con todas las herramientas
├── post-create.sh      # Script de configuración inicial
└── README.md           # Esta documentación
```

## 🛠️ Configuración Personalizada

### Variables de Entorno Preconfiguradas
```bash
NODE_ENV=development
AZURE_TENANT_ID=3f93adcc-4946-4596-aeb9-9af740604449
AZURE_SUBSCRIPTION_ID=99413916-a97c-4a32-949c-a37ad1c78686
AZURE_RESOURCE_GROUP=rg-devoteam-westeu-001
AZURE_WEBAPP_NAME=dev-tae-eu-w-tes-cms-win
```

### Puertos Expuestos
- **5173** - Vite Development Server
- **3000** - Express Server
- **4173** - Vite Preview Server

### Volúmenes
- **node_modules** - Volumen nombrado para mejor performance
- **Código fuente** - Montado como cached volume
- **Docker socket** - Para Docker-in-Docker

## 🎯 Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar linter
npm run lint
```

### Scripts Personalizados
```bash
# Script completo de desarrollo
./dev-start.sh

# Build y preview
./build-and-preview.sh
```

### Azure CLI
```bash
# Autenticar en Azure
az login --tenant 3f93adcc-4946-4596-aeb9-9af740604449

# Obtener publish profile
./setup-azure.ps1

# Ver estado del App Service
az webapp show --name $AZURE_WEBAPP_NAME --resource-group $AZURE_RESOURCE_GROUP
```

### GitLab CLI
```bash
# Autenticar en GitLab
glab auth login

# Ver pipelines
glab ci list

# Ver merge requests
glab mr list
```

## 🔧 Tasks de VS Code

El devcontainer incluye tasks preconfiguradas accesibles con `Ctrl+Shift+P` → "Tasks: Run Task":

- **dev: Start Vite Dev Server** - Inicia el servidor de desarrollo
- **build: Build for Production** - Construye la aplicación
- **lint: Run ESLint** - Ejecuta el linter
- **preview: Preview Build** - Inicia el servidor de preview
- **Azure: Get Publish Profile** - Obtiene el publish profile de Azure

## 🐛 Debug Configuration

El devcontainer incluye configuraciones de debug para:
- **Launch React App** - Debug del cliente React
- **Launch Express Server** - Debug del servidor Express
- **Attach to Chrome** - Debug en el navegador

## 📝 Archivos Creados Automáticamente

El script post-create creará automáticamente:
- `.env.local` - Variables de entorno locales
- `.vscode/launch.json` - Configuración de debug
- `.vscode/tasks.json` - Tasks personalizadas
- `dev-start.sh` - Script de inicio rápido
- `build-and-preview.sh` - Script de build y preview

## 🔒 Seguridad

### Variables Sensibles
Las variables como `AZURE_WEBAPP_PUBLISH_PROFILE` deben configurarse en:
- GitLab CI/CD Variables (para pipeline)
- Configuración local de VS Code (para desarrollo local)

### Autenticación
- Azure CLI requiere `az login` la primera vez
- GitLab CLI requiere `glab auth login` para funcionalidades avanzadas

## 🚨 Troubleshooting

### Container no inicia
```bash
# Reconstruir container
Ctrl+Shift+P → "Dev Containers: Rebuild Container"

# Ver logs
docker logs <container_id>
```

### Problemas con node_modules
```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# O desde VS Code
Ctrl+Shift+P → "Tasks: Run Task" → "npm: install"
```

### Problemas con permisos
```bash
# Verificar usuario
whoami

# Cambiar permisos si es necesario
sudo chown -R vscode:vscode /workspace
```

### Azure CLI no autenticado
```bash
# Autenticar
az login --tenant 3f93adcc-4946-4596-aeb9-9af740604449

# Verificar autenticación
az account show
```

## 📚 Recursos Adicionales

- [VS Code Dev Containers](https://code.visualstudio.com/docs/remote/containers)
- [Docker Documentation](https://docs.docker.com/)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [GitLab CLI Documentation](https://gitlab.com/gitlab-org/cli)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)

## 🤝 Contribuir

Para mejorar el devcontainer:
1. Modifica los archivos en `.devcontainer/`
2. Reconstruye el container para probar cambios
3. Documenta cambios importantes
4. Crea MR con las mejoras

¡Happy coding! 🎉
