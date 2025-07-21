// server.js - Versión compatible con Azure App Service Windows
const express = require('express');
const path = require('path');
const fs = require('fs');

// Crear aplicación Express
const app = express();

// Puerto para el servidor (Azure usa process.env.PORT)
const port = process.env.PORT || process.env.IISNODE_PORT || 8080;

// Configuración básica para JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Log para debugging en Azure
console.log('🚀 Iniciando servidor Node.js...');
console.log('📂 Directorio actual:', __dirname);
console.log('🌐 Puerto:', port);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 IISNODE_PORT:', process.env.IISNODE_PORT);

// Verificar si existe la carpeta dist
const distPath = path.join(__dirname, 'dist');

try {
  if (fs.existsSync(distPath)) {
    console.log('✅ Carpeta dist encontrada');
    // Servir archivos estáticos desde dist
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: false
    }));
    console.log('📁 Sirviendo archivos desde:', distPath);
  } else {
    console.log('⚠️ Carpeta dist no encontrada, sirviendo desde raíz');
    // Servir archivos estáticos desde raíz como fallback
    app.use(express.static(__dirname, {
      maxAge: '1d',
      etag: false
    }));
    console.log('📁 Sirviendo archivos desde:', __dirname);
  }
} catch (error) {
  console.error('❌ Error configurando archivos estáticos:', error);
}

// Ruta de salud para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  console.log('✅ Health check solicitado');
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    directory: __dirname,
    distExists: fs.existsSync(distPath)
  });
});

// Log de todas las solicitudes para debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Ruta comodín para SPA - DEBE estar al final
app.get('*', (req, res) => {
  try {
    // Intentar primero desde dist, luego desde raíz
    let indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      indexPath = path.join(__dirname, 'index.html');
    }
    
    console.log('📄 Enviando index.html desde:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, {
        maxAge: '1h',
        etag: false
      });
    } else {
      console.error('❌ index.html no encontrado en ninguna ubicación');
      console.log('📂 Contenido del directorio raíz:');
      try {
        const files = fs.readdirSync(__dirname).slice(0, 10); // Solo primeros 10
        console.log(files);
      } catch (dirErr) {
        console.error('❌ Error leyendo directorio:', dirErr);
      }
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error 404 - Aplicación no encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .error { background: #ffebee; padding: 20px; border-radius: 5px; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Error 404 - Aplicación no encontrada</h1>
            <p>La aplicación no se ha buildeado correctamente.</p>
          </div>
          <div class="info">
            <h3>Información de Debug:</h3>
            <p><strong>Directory:</strong> ${__dirname}</p>
            <p><strong>Dist exists:</strong> ${fs.existsSync(distPath)}</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>NODE_ENV:</strong> ${process.env.NODE_ENV}</p>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('❌ Error en ruta comodín:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Iniciar el servidor
const server = app.listen(port, () => {
  console.log(`✅ Servidor iniciado en puerto ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
});

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});