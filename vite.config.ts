import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/handlers.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash || url.username || url.password) return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}/`;
  } catch {
    return null;
  }
}

function apiMiddleware(): Plugin {
  return {
    name: 'send-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleApiRequest(req, res)
          .then((handled) => { if (!handled) next(); })
          .catch(next);
      });
    }
  };
}

function searchMetadata(siteUrl: string | null): Plugin {
  return {
    name: 'send-search-metadata',
    transformIndexHtml(html) {
      const canonicalTags = siteUrl
        ? `<link rel="canonical" href="${siteUrl}" />\n    <meta property="og:url" content="${siteUrl}" />`
        : '';
      let transformed = html
        .replace('<!-- SITE_CANONICAL -->', canonicalTags)
        .replace('<!-- SITE_URL_META -->', '');

      if (siteUrl) {
        transformed = transformed.replace(
          /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
          (_match, openingTag: string, json: string, closingTag: string) => {
            const structuredData = JSON.parse(json) as Record<string, unknown>;
            structuredData.url = siteUrl;
            return `${openingTag}\n    ${JSON.stringify(structuredData, null, 2).replace(/\n/g, '\n    ')}\n    ${closingTag}`;
          }
        );
      }
      return transformed;
    },
    closeBundle() {
      if (!siteUrl) return;

      const outputDirectory = resolve(projectRoot, 'dist');
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <url><loc>${siteUrl}</loc></url>\n` +
        `</urlset>\n`;
      writeFileSync(resolve(outputDirectory, 'sitemap.xml'), sitemap, 'utf8');

      const robotsPath = resolve(outputDirectory, 'robots.txt');
      const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : 'User-agent: *\nAllow: /\n';
      const robotsWithoutSitemaps = robots.replace(/^Sitemap:.*\r?\n?/gim, '').trimEnd();
      writeFileSync(robotsPath, `${robotsWithoutSitemaps}\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`, 'utf8');
    }
  };
}

export default defineConfig(() => {
  const siteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL);

  return {
    plugins: [react(), apiMiddleware(), searchMetadata(siteUrl)],
    server: {
      port: 5173,
      host: true,
      watch: {
        ignored: ['**/public/video/**', '**/*.mp4']
      }
    }
  };
});
