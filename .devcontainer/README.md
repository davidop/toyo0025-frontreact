# DevContainer - Toyota Events Development Environment

Este devcontainer proporciona un entorno de desarrollo completo y consistente para el proyecto Toyota Events Management System.

⚠️ **IMPORTANTE**: Este devcontainer está configurado SOLO para desarrollo local. Los despliegues deben realizarse exclusivamente a través del pipeline de GitLab CI/CD.

## 🚀 Características del DevContainer

### Herramientas Incluidas

- **Node.js 18** - Runtime de JavaScript
- **GitLab CLI (glab)** - Integración con GitLab para monitoreo de pipelines
- **VS Code Extensions** - Extensiones preconfiguradas para React

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

### 2. Iniciar DevContainer

```bash
# Clonar repositorio
git clone <repository-url>
cd toyo0025-frontreact

# Abrir en VS Code
code .

# Presionar F1 → "Dev Containers: Open Folder in Container"
```

### 3. Primer Uso

El devcontainer automáticamente:

- Instala todas las dependencias (`npm install`)
- Configura el entorno de desarrollo
- Prepara las extensiones de VS Code

## 💻 Comandos de Desarrollo

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para validar antes de commit
npm run build

# Preview del build local
npm run preview

# Ejecutar linter
npm run lint
```

### GitLab CI/CD Monitoring

```bash
# Autenticar en GitLab
glab auth login

# Ver estado de pipelines
glab ci list

# Ver merge requests
glab mr list

# Ver último pipeline del branch actual
glab ci status
```

## 🔧 Tasks de VS Code

Tasks preconfiguradas accesibles con `Ctrl+Shift+P` → "Tasks: Run Task":

- **dev: Start Vite Dev Server** - Inicia el servidor de desarrollo
- **build: Build for Production** - Construye la aplicación para validar
- **lint: Run ESLint** - Ejecuta el linter
- **preview: Preview Build** - Inicia el servidor de preview

## 🐛 Debug Configuration

El devcontainer incluye configuraciones de debug para:

- **Launch React App** - Debug del cliente React
- **Launch Express Server** - Debug del servidor Express
- **Attach to Chrome** - Debug en el navegador

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

## 🔒 Recordatorio de Despliegue

**❌ PROHIBIDO desde DevContainer:**

- Cualquier despliegue manual
- Uso de Azure CLI para despliegues
- Scripts de configuración o deployment

**✅ PERMITIDO únicamente:**

- Desarrollo local
- Testing y validación
- Monitoreo de pipelines GitLab via `glab`
- Push de código para activar pipeline automático

## 📚 Recursos de Desarrollo

- [VS Code Dev Containers](https://code.visualstudio.com/docs/remote/containers)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)

## 🤝 Contribuir

Para mejorar el devcontainer:

1. Modifica los archivos en `.devcontainer/`
2. Reconstruye el container para probar cambios
3. Documenta cambios importantes
4. Crea MR con las mejoras

¡Happy coding! 🎉
