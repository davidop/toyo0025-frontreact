# 🚀 Guía de Despliegue en Azure App Service

## Configuración Requerida

### 1. Variables de Entorno en GitLab

Debes configurar las siguientes variables en GitLab CI/CD Variables (Settings > CI/CD > Variables):

#### Variables Obligatorias:

- `AZURE_WEBAPP_PUBLISH_PROFILE`: Perfil de publicación de tu App Service de desarrollo
- `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`: (Opcional) Perfil de publicación para producción

#### Variables Opcionales:

- `AZURE_WEBAPP_NAME_PROD`: Nombre del App Service de producción (si es diferente al de desarrollo)

### 2. Cómo obtener el Publish Profile

1. **Desde el Portal de Azure:**

   - Ve a tu App Service: `dev-tae-eu-w-tes-cms-win`
   - Haz clic en **"Get publish profile"** en la barra superior
   - Se descargará un archivo `.publishsettings`
   - Abre el archivo con un editor de texto
   - Copia **todo el contenido XML**

2. **Configurar en GitLab:**
   - Ve a tu proyecto GitLab
   - Settings → CI/CD → Variables
   - Agregar nueva variable:
     - **Key:** `AZURE_WEBAPP_PUBLISH_PROFILE`
     - **Value:** Pega todo el contenido XML del archivo
     - **Protected:** ✅ Sí
     - **Masked:** ❌ No (contiene caracteres especiales)

### 3. Estructura del Pipeline

El pipeline tiene 3 etapas:

```

```

🔧 BUILD (automático)
├── Instala dependencias
├── Ejecuta linter
├── Construye la aplicación React
└── Prepara artefactos para despliegue

🧪 TEST (automático)
└── Ejecuta tests

🚀 DEPLOY (manual obligatorio)
└── Despliegue controlado via GitLab UI únicamente

```

### Proceso de Despliegue

#### ✅ Único Método Autorizado:
1. **Push** tu código a `main`, `develop` o `master`
2. El pipeline ejecutará automáticamente **build** y **test**
3. Ve a **GitLab → Pipelines**
4. Haz clic en **"Deploy"** (acción manual requerida)
5. Espera confirmación de despliegue exitoso

#### ❌ Métodos Completamente Prohibidos:
- Cualquier despliegue desde máquina local
- Uso directo de Azure CLI
- Acceso manual al App Service via Azure Portal
- Scripts de PowerShell o Bash de despliegue
- Herramientas de terceros (VS Code extensions, etc.)
- Bypass del pipeline de GitLab
```

### 4. Archivos Incluidos en el Despliegue

- `dist/` - Aplicación React compilada
- `server.js` - Servidor Express
- `package.json` y `package-lock.json` - Dependencias
- `web.config` - Configuración IIS
- `iisnode.yml` - Configuración Node.js para IIS
- `cors-proxy.js` - Proxy CORS (si existe)

### 5. Proceso de Despliegue

#### Para Desarrollo:

1. Push tu código a cualquier rama (main, develop, master)
2. El pipeline se ejecutará automáticamente hasta la etapa de build
3. Ve a GitLab → Pipelines → Selecciona tu pipeline
4. Haz clic en **"Deploy Development"** (manual)
5. Espera a que termine y verifica en: https://dev-tae-eu-w-tes-cms-win.azurewebsites.net

#### Para Producción:

1. Push tu código a `main` o `master`
2. El pipeline se ejecutará automáticamente hasta la etapa de build
3. Ve a GitLab → Pipelines → Selecciona tu pipeline
4. Haz clic en **"Deploy Production"** (manual)
5. ⚠️ **Confirmación requerida** - Este es el ambiente de producción

### 6. Verificación del Despliegue

El pipeline verificará automáticamente que la aplicación esté funcionando llamando a:

```
https://tu-app.azurewebsites.net/api/health
```

Esta ruta devuelve:

```json
{
  "status": "ok",
  "message": "Servidor funcionando correctamente"
}
```

### 7. Configuración de Azure App Service

Asegúrate de que tu App Service tenga:

- **Runtime stack:** Node 18 LTS
- **Platform settings:** 64-bit
- **Always On:** Enabled (para evitar cold starts)
- **Web sockets:** Enabled (si tu app los usa)

### 8. Solución de Problemas

#### Error: "AZURE_WEBAPP_PUBLISH_PROFILE no configurado"

- Verifica que hayas configurado la variable en GitLab CI/CD Variables
- Asegúrate de que el contenido sea el XML completo del publish profile

#### Error en el despliegue ZIP

- El pipeline reintenta automáticamente hasta 3 veces
- Verifica que el App Service esté ejecutándose y disponible

#### Aplicación no responde después del despliegue

- Azure App Service puede tardar hasta 2-3 minutos en inicializar
- Verifica los logs en el portal de Azure: App Service → Log stream

#### Error de routing en React Router

- El archivo `web.config` está configurado para manejar rutas de SPA
- Todas las rutas no-API redirigen a `index.html`

### 9. Comandos Útiles

Para probar localmente:

```bash
npm run build
npm start
```

Para verificar la aplicación:

```bash
curl https://tu-app.azurewebsites.net/api/health
```

### 10. Ambientes

- **Desarrollo:** Cualquier rama puede desplegar manualmente
- **Producción:** Solo ramas `main`/`master` pueden desplegar manualmente

### 11. Caché

El pipeline usa caché para `node_modules` para acelerar los builds:

- Clave: `$CI_COMMIT_REF_SLUG-$CI_COMMIT_SHA`
- Ubicación: `node_modules/`

---

## 🎯 Próximos Pasos

1. ✅ Configurar `AZURE_WEBAPP_PUBLISH_PROFILE` en GitLab
2. ✅ Hacer push de tu código
3. ✅ Ejecutar el pipeline y desplegar manualmente
4. ✅ Verificar que la aplicación funcione correctamente

¿Necesitas ayuda con algún paso específico? 🤝
