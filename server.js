// server.js - Versión compatible con Azure App Service Windows
const express = require('express');
const path = require('path');
const fs = require('fs');

// Crear aplicación Express
const app = express();

// Puerto para el servidor (Azure usa process.env.PORT)
const port = process.env.PORT || 8080;

// Log para debugging en Azure
console.log('🚀 Iniciando servidor Node.js...');
console.log('📂 Directorio actual:', __dirname);
console.log('🌐 Puerto:', port);

// Verificar si existe la carpeta dist
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  console.log('✅ Carpeta dist encontrada');
  // Servir archivos estáticos desde dist
  app.use(express.static(distPath));
  console.log('📁 Sirviendo archivos desde:', distPath);
} else {
  console.log('⚠️ Carpeta dist no encontrada, sirviendo desde raíz');
  // Servir archivos estáticos desde raíz como fallback
  app.use(express.static(__dirname));
  console.log('📁 Sirviendo archivos desde:', __dirname);
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
  // Intentar primero desde dist, luego desde raíz
  let indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, 'index.html');
  }
  
  console.log('📄 Enviando index.html desde:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html no encontrado en ninguna ubicación');
    console.log('📂 Contenido del directorio raíz:');
    try {
      const files = fs.readdirSync(__dirname);
      console.log(files);
    } catch (dirErr) {
      console.error('❌ Error leyendo directorio:', dirErr);
    }
    res.status(404).send(`
      <html>
        <body>
          <h1>Error 404 - Aplicación no encontrada</h1>
          <p>La aplicación no se ha buildeado correctamente.</p>
          <p>Directory: ${__dirname}</p>
          <p>Dist exists: ${fs.existsSync(distPath)}</p>
        </body>
      </html>
    `);
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`✅ Servidor iniciado en puerto ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
});