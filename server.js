// server.js - Versión ultra-simple para Azure App Service Windows
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Log básico
console.log('Server starting on port:', port);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('App not found');
    }
  });
});

app.listen(port, () => {
  console.log('Server running on port:', port);
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