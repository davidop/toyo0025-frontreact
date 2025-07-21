// server.js - Versión mejorada para Azure App Service Windows
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Iniciando servidor...');
console.log('📁 Directorio actual:', __dirname);
console.log('🌍 Puerto:', port);

// Middleware básico
try {
  // Verificar si dist/ existe
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Carpeta dist encontrada');
    app.use(express.static(distPath));
  } else {
    console.log('⚠️ Carpeta dist no encontrada, usando raíz');
  }
  
  // Servir también desde raíz como fallback
  app.use(express.static(__dirname));
  
} catch (error) {
  console.error('❌ Error configurando archivos estáticos:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('❤️ Health check solicitado');
  try {
    const distExists = fs.existsSync(path.join(__dirname, 'dist'));
    const files = fs.readdirSync(__dirname).slice(0, 10); // Solo primeros 10
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      directory: __dirname,
      distExists: distExists,
      files: files
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Catch-all handler: envía de vuelta React's index.html file
app.get('*', (req, res) => {
  console.log('📄 Solicitando:', req.url);
  
  try {
    // Primero intentar desde dist/
    let indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Enviando index.html desde dist/');
      res.sendFile(indexPath);
    } else {
      // Intentar desde raíz
      indexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ Enviando index.html desde raíz');
        res.sendFile(indexPath);
      } else {
        console.log('❌ index.html no encontrado');
        const files = fs.readdirSync(__dirname).slice(0, 20);
        res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Debug Info</title></head>
          <body>
            <h1>🔍 Debug Information</h1>
            <p><strong>Directorio:</strong> ${__dirname}</p>
            <p><strong>Dist exists:</strong> ${fs.existsSync(path.join(__dirname, 'dist'))}</p>
            <h3>Archivos disponibles:</h3>
            <ul>${files.map(f => `<li>${f}</li>`).join('')}</ul>
          </body>
          </html>
        `);
      }
    }
  } catch (error) {
    console.error('❌ Error en catch-all:', error);
    res.status(500).send(`
      <h1>Error interno</h1>
      <p>Error: ${error.message}</p>
      <p>Directory: ${__dirname}</p>
    `);
  }
});

// Manejo de errores global
app.use((error, req, res, _next) => {
  console.error('💥 Error no manejado:', error);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Iniciar servidor
try {
  app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
  });
} catch (error) {
  console.error('💥 Error iniciando servidor:', error);
}

// Manejo de errores de proceso
process.on('uncaughtException', (err) => {
  console.error('💥 Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Promesa rechazada:', err);
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
            <p><strong>Dist exists:</strong> ${fs.existsSync(path.join(__dirname, 'dist'))}</p>
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