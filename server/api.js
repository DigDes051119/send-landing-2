import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './handlers.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distributionDirectory = path.join(projectRoot, 'dist');
const port = Number(process.env.PORT) || 5173;

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  try {
    if (await handleApiRequest(req, res)) return;
  } catch (error) {
    console.error('[Send API error]', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } }));
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  if (!existsSync(distributionDirectory)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build the site with npm run build before starting the server.');
    return;
  }

  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid URL');
    return;
  }

  const requestedFile = requestPath === '/' ? 'index.html' : `.${requestPath}`;
  let filePath = path.resolve(distributionDirectory, requestedFile);
  const insideDistribution = filePath === distributionDirectory || filePath.startsWith(`${distributionDirectory}${path.sep}`);

  if (!insideDistribution) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  if (!existsSync(filePath) && !path.extname(requestPath)) {
    filePath = path.join(distributionDirectory, 'index.html');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const fileSize = statSync(filePath).size;
  const isVideo = extension === '.mp4';
  const range = isVideo ? req.headers.range : undefined;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      res.end();
      return;
    }

    const suffixLength = match[1] ? null : Number(match[2]);
    const start = suffixLength === null ? Number(match[1]) : Math.max(fileSize - suffixLength, 0);
    const end = Math.min(match[2] && match[1] ? Number(match[2]) : fileSize - 1, fileSize - 1);
    if (!Number.isSafeInteger(start) || start >= fileSize || end < start) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      res.end();
      return;
    }

    res.writeHead(206, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Content-Length': fileSize,
    ...(isVideo ? { 'Accept-Ranges': 'bytes' } : {}),
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=86400'
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`[Send Messenger] Server listening on port ${port}`);
});
