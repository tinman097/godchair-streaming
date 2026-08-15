import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);

    // Security: prevent directory traversal
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(DIST_DIR, safePath);

    // If the path has no extension, try to serve index.html (SPA routing)
    const ext = extname(filePath);
    if (!ext || ext === '.html') {
      // Check if the file exists, otherwise serve index.html for client-side routing
      try {
        const s = await stat(filePath);
        if (s.isFile()) {
          const data = await readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
          return;
        }
      } catch {
        // File doesn't exist, fall through to index.html
      }
      filePath = join(DIST_DIR, 'index.html');
    }

    const data = await readFile(filePath);
    const contentType = MIME[extname(filePath)] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(data);
  } catch {
    // Fallback to index.html for any 404 (SPA routing)
    try {
      const data = await readFile(join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`GodChair running on port ${PORT}`);
  console.log(`Local:  http://localhost:${PORT}`);
  console.log(`Network: http://<pi-ip-address>:${PORT}`);
});
