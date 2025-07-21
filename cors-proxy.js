// Servidor proxy para evitar problemas CORS durante desarrollo
const cors_proxy = require('cors-anywhere');

// Configuración del servidor proxy
const host = 'localhost';
const port = 8081;

// Crear e iniciar el servidor proxy
cors_proxy.createServer({
  originWhitelist: [], // Permitir todas las solicitudes durante desarrollo
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2'],
}).listen(port, host, () => {
  console.log(`Servidor proxy CORS ejecutándose en http://${host}:${port}`);
});
