// server.js - Versión simplificada para Azure App Service
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración básica para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear aplicación Express
const app = express();

// Puerto para el servidor
const port = process.env.PORT || 8080;

// Configuración básica
app.use(express.json());

// Servir archivos estáticos desde la carpeta dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Ruta simple para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta comodín para SPA - debe estar al final
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});