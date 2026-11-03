// Servidor estático mínimo para Railway (sin dependencias). Railway define PORT.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT) || 4300;
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json'
};
// Solo se publica el sitio: ni archivos ocultos ni herramientas ni el propio servidor.
const blocked = /(^|\/)(\.|_tools|node_modules|referencias)|^\/(server\.mjs|package\.json)$/;

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (!file.startsWith(root) || blocked.test(path)) return send(res, 404);
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      // Sin caché larga: cada deploy se ve de inmediato.
      'Cache-Control': 'no-cache'
    });
    res.end(body);
  } catch { send(res, 404); }
}).listen(port, () => console.log(`Parque Andino Juncal en http://localhost:${port}`));

function send(res, status) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado');
}
