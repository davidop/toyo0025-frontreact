// server.js - Versión compatible con Azure App Service Windows
const express = require('express');
const path = require('path');

// Crear aplicación Express
const app = express();

// Puerto para el servidor (Azure usa process.env.PORT)
const port = process.env.PORT || 8080;

// Configuración básica
app.use(express.json());

// Log para debugging en Azure
console.log('🚀 Iniciando servidor Node.js...');
console.log('📂 Directorio actual:', __dirname);
console.log('🌐 Puerto:', port);

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta de salud para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  console.log('✅ Health check solicitado');
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    directory: __dirname
  });
});

// Log de todas las solicitudes para debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Ruta comodín para SPA - DEBE estar al final
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  console.log('📄 Enviando index.html desde:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error enviando index.html:', err);
      res.status(500).send('Error interno del servidor');
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`✅ Servidor iniciado en puerto ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
});