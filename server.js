// server.js - Optimizado para Azure App Service Windows con iisnode
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || process.env.IISNODE_PORT || 3000;

console.log('Starting server...');
console.log('Port:', port);
console.log('Directory:', __dirname);

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos desde dist/
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: false
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port,
    directory: __dirname
  });
});

// Catch-all handler para SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send(`
        <h1>Error Loading Application</h1>
        <p>Could not find index.html at: ${indexPath}</p>
        <p>Current directory: ${__dirname}</p>
        <p>Error: ${err.message}</p>
      `);
    }
  });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});
