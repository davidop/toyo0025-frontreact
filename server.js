// server.js - Versión ultra-simple para Azure App Service Windows
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || process.env.IISNODE_PORT || 1337;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Health check básico
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(port);
