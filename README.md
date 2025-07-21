# Toyota Events Management System

Sistema de gestión de eventos desarrollado con React + Vite, diseñado para ser desplegado en Azure App Service.

## 🚀 Características

- **Frontend**: React 18 con Vite
- **Backend**: Node.js/Express
- **UI**: Material-UI (MUI)
- **Estado**: React Query para manejo de estado del servidor
- **Formularios**: Formik con validación
- **Despliegue**: Azure App Service con pipeline GitLab CI/CD

## 📋 Requisitos Previos

- Node.js 18+
- npm 9+
- Azure CLI (para despliegue)
- Cuenta de Azure con suscripción activa

## � Despliegue en Azure

### Configuración Rápida

1. **Ejecutar script de configuración**:

   ```bash
   ./setup-deployment.sh
   ```

2. **Configurar variables en GitLab**:

   - Ve a Settings → CI/CD → Variables
   - Agrega `AZURE_WEBAPP_PUBLISH_PROFILE` (obtén desde Azure Portal)
   - Ver [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) para instrucciones detalladas

3. **Desplegar**:
   - Push tu código a cualquier rama
   - Ve a GitLab → Pipelines
   - Ejecuta manualmente "Deploy Development"

### Pipeline CI/CD

El proyecto incluye un pipeline completo de GitLab CI/CD:

- **Build**: Instala dependencias, ejecuta linter, construye la aplicación
- **Test**: Ejecuta pruebas (configurar según necesidades)
- **Deploy**: Despliegue automático a Azure App Service

**Ambientes**:

- 🔧 **Desarrollo**: Cualquier rama autorizada → despliegue via GitLab CI/CD
- 🚀 **Producción**: Solo `main`/`master` → despliegue via GitLab CI/CD

**URL de la aplicación**: https://dev-tae-eu-w-tes-cms-win.azurewebsites.net

### Archivos de Configuración Azure

- `web.config` - Configuración IIS para Azure App Service
- `iisnode.yml` - Configuración Node.js para IIS
- `.gitlab-ci.yml` - Pipeline CI/CD (ÚNICA forma de desplegar)
- `server.js` - Servidor Express para producción

📚 **Documentación completa**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## 🛠️ Desarrollo Local

```bash
# Clonar repositorio
git clone <repository-url>
cd toyo0025-frontreact

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Servir build de producción localmente
npm run preview
```

## 🚀 Despliegue Obligatorio via GitLab CI/CD

⚠️ **IMPORTANTE**: El despliegue manual está **PROHIBIDO**. Todos los despliegues se realizan exclusivamente a través del pipeline de GitLab CI/CD.

### Información del App Service

- **App Service**: `dev-tae-eu-w-tes-cms-win`
- **Resource Group**: `rg-devoteam-westeu-001`
- **URL**: `https://dev-tae-eu-w-tes-cms-win.azurewebsites.net`

### Configuración Requerida

1. **Configurar variable en GitLab**:

   - Settings → CI/CD → Variables
   - Agregar `AZURE_WEBAPP_PUBLISH_PROFILE` (obtener desde Azure Portal)

2. **Proceso de Despliegue**:
   - Push código a `main`, `develop` o `master`
   - Ve a GitLab → Pipelines
   - Ejecutar manualmente el job de despliegue correspondiente

### Pipeline CI/CD

- **Build/Test**: Automático en push
- **Deploy Development**: Manual desde GitLab UI
- **Deploy Production**: Manual, solo rama main/master

📚 **Documentación**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
├── pages/             # Páginas principales
├── services/          # APIs y servicios
├── stores/            # Estado global
├── hooks/             # Custom hooks
├── utils/             # Utilidades
└── theme/             # Configuración de tema
```

## 🔧 Scripts Disponibles

```bash
npm run dev         # Desarrollo con hot reload
npm run build       # Build para producción
npm run preview     # Preview del build
npm run lint        # Ejecutar ESLint
npm start           # Iniciar servidor de producción
```

## 🌍 Entornos

- **Desarrollo Local**: `http://localhost:5173`
- **App Service**: `https://dev-tae-eu-w-tes-cms-win.azurewebsites.net`

## 📚 Documentación Adicional

- [DevContainer Setup](./.devcontainer/README.md) - Entorno de desarrollo en container
- [Configuración de Pipeline](./PIPELINE-SETUP.md) - Guía detallada de CI/CD
- [Troubleshooting Windows](./TROUBLESHOOTING-WINDOWS.md) - Solución de problemas en Windows

## 🤝 Contribución

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -m 'Añadir nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Este proyecto es propietario de Toyota Motor Corporation.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
