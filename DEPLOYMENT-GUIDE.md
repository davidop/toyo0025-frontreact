# 🚀 Guía SIMPLE para Desarrolladores Junior

## ¿Cómo desplegar tu código?

### 📋 Pasos básicos:

1. **Haz tus cambios** en el código
2. **Commit y push** a una rama autorizada (`main`, `develop`, o `master`)
3. **Ve a GitLab** → Tu proyecto → Pipelines
4. **Haz clic en "Deploy"** (botón manual)
5. **Espera** a que termine y listo! ✅

## 🔧 Configuración inicial (SOLO UNA VEZ)

Si es la primera vez, necesitas configurar Azure:

1. **Ve a Azure Portal**: https://portal.azure.com
2. **Busca**: `dev-tae-eu-w-tes-cms-win`
3. **Haz clic** en "Get publish profile"
4. **Descarga** el archivo `.publishsettings`
5. **Abre el archivo** con un editor de texto
6. **Copia TODO** el contenido XML
7. **Ve a GitLab** → Settings → CI/CD → Variables
8. **Crea nueva variable**:
   - Nombre: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Valor: Pega el contenido XML
   - Protected: ✅ Sí

## 📖 ¿Qué hace el pipeline?

### ETAPA 1 - Build (Automático):

- 📥 Instala dependencias (`npm install`)
- 🔨 Construye la aplicación React (`npm run build`)
- 📁 Prepara archivos para Azure
- ✅ Crea un "paquete" listo para desplegar

### ETAPA 2 - Deploy (Manual):

- 📦 Empaqueta todo en un ZIP
- 🌐 Sube a Azure App Service
- ⏳ Verifica que funcione
- 🎉 ¡Listo!

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

## ❓ Preguntas Frecuentes

### ¿En qué ramas puedo desplegar?

Solo en: `main`, `develop`, o `master`

### ¿Por qué el deploy es manual?

Para evitar despliegues accidentales. Siempre necesitas hacer clic en "Deploy".

### ¿Dónde veo mi aplicación?

En: https://dev-tae-eu-w-tes-cms-win.azurewebsites.net

### ¿Qué hago si falla?

1. Mira los logs del pipeline en GitLab
2. Verifica que tu código compile localmente (`npm run build`)
3. Pide ayuda al equipo senior

## 🚨 Errores Comunes

### "ERROR: Falta configuración de Azure"

- Necesitas configurar `AZURE_WEBAPP_PUBLISH_PROFILE`
- Sigue los pasos de "Configuración inicial" arriba

### "Build failed"

- Tu código tiene errores de sintaxis
- Ejecuta `npm run build` localmente para verificar

### "Deploy failed"

- Problema de conectividad con Azure
- Reintenta el deploy después de unos minutos

## ✅ Checklist antes de desplegar

- [ ] Mi código funciona localmente (`npm run dev`)
- [ ] El build funciona (`npm run build`)
- [ ] Hice commit y push a la rama correcta
- [ ] Estoy en GitLab viendo los pipelines
- [ ] Hago clic en "Deploy" y espero

---

**🎯 ¡Es así de simple!** No necesitas conocer Azure, Docker, o configuraciones complejas. Solo sigue estos pasos y tu código estará en producción.

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
