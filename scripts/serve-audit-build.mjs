import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Production-equivalent audit server for Lighthouse.
 * Serves dist/ over HTTP, gzips text assets, and removes the preview-only
 * noindex meta so SEO can be scored the way the production build will be.
 *
 * Usage: node scripts/serve-audit-build.mjs [port]
 */

const root = path.resolve('dist');
const port = Number(process.argv[2] || 4330);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

const compressible = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml']);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);

  if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, 'index.html')) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let body;
  try {
    body = fs.readFileSync(filePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  };

  if (ext === '.html') {
    body = Buffer.from(
      body
        .toString('utf8')
        .replace(/\s*<meta name="robots" content="noindex, nofollow"\s*\/?>/i, ''),
      'utf8'
    );
  }

  if (compressible.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = zlib.gzipSync(body, { level: 9 });
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }

  headers['Content-Length'] = body.length;
  res.writeHead(200, headers).end(body);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Audit build listening on http://127.0.0.1:${port}/`);
});
