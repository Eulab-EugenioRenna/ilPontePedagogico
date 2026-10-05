import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { pageSeo, renderSeoHead, siteUrl } from '../config/seo.js';
import { contact } from '../src/data/siteContent.js';
import { seoPages } from '../config/seo-pages.js';

// Usa lo stesso mode di Vite anche per flag e contenuti del prerender.
const modeFlag = process.argv.indexOf('--mode');
const mode = modeFlag >= 0 ? process.argv[modeFlag + 1] : 'production';
const server = await createServer({ mode, server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
try {
  const [{ default: App }, { comingSoon }] = await Promise.all([
    server.ssrLoadModule('/src/App.jsx'), server.ssrLoadModule('/src/config/flags.js'),
  ]);
  const template = await readFile('dist/index.html', 'utf8');
  const routes = [['/', 'index.html'], ['/appuntamenti', 'appuntamenti.html'], ['/404', '404.html'], ...seoPages.map((page) => [page.path, `${page.path.slice(1)}.html`])];
  for (const [pathname, file] of routes) {
    const seo = pageSeo(pathname, comingSoon);
    const content = renderToString(React.createElement(App, { initialPath: pathname }));
    const html = template
      .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${renderSeoHead(seo, contact)}\n    <!-- seo:end -->`)
      .replace('<div id="root"></div>', () => `<div id="root">${content}</div>`);
    await writeFile(`dist/${file}`, html);
  }
  // Solo URL pubblici canonici, senza frammenti, parametri o area riservata.
  // Nessun lastmod artificiale: una build non prova un aggiornamento editoriale.
  const urls = comingSoon ? [] : ['/', ...seoPages.map((page) => page.path)];
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>\n`).join('')}</urlset>\n`);
  // /appuntamenti resta scansionabile perché il crawler possa leggere noindex.
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  console.log(`SEO: HTML prerenderizzato, sitemap e robots.txt generati (${comingSoon ? 'in arrivo, noindex' : 'sito pubblico'}).`);
} finally {
  await server.close();
}
