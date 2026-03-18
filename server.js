import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const DIST = join(__dirname, 'dist');

const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.mjs':   'application/javascript',
  '.css':   'text/css',
  '.json':  'application/json',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.txt':   'text/plain',
  '.webmanifest': 'application/manifest+json',
};

const INDEX = join(DIST, 'index.html');

createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}`);
  let pathname = decodeURIComponent(url.pathname);

  // Resolve file path
  let filePath = join(DIST, pathname);

  // Directory → index.html
  if (pathname.endsWith('/')) {
    filePath = join(filePath, 'index.html');
  }

  // If file doesn't exist and has no extension → SPA fallback
  if (!existsSync(filePath) || (!extname(filePath) && !existsSync(filePath))) {
    filePath = INDEX;
  }

  try {
    const data = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache static assets (hashed filenames), not index.html
    const cacheControl = ext === '.html'
      ? 'no-cache'
      : 'public, max-age=31536000, immutable';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.byteLength,
      'Cache-Control': cacheControl,
    });
    res.end(data);
  } catch {
    // Final fallback
    try {
      const index = readFileSync(INDEX);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(index);
    } catch {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }
}).listen(PORT, HOST, () => {
  console.log(`[NTS] Production server running on http://${HOST}:${PORT}`);
  console.log(`[NTS] Serving static files from ${DIST}`);
});
