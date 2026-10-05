import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { pageSeo, renderSeoHead } from './config/seo.js';
import { contact } from './src/data/siteContent.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const comingSoon = ['1', 'true', 'yes', 'y', 'on', 'si', 'sì'].includes((env.VITE_COMING_SOON || '').trim().toLowerCase());
  return {
    plugins: [react(), {
      name: 'site-seo',
      transformIndexHtml(html, context) {
        const pathname = context.server ? new URL(context.originalUrl || '/', 'http://localhost').pathname : '/';
        return html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n    ${renderSeoHead(pageSeo(pathname, comingSoon), contact)}\n    <!-- seo:end -->`);
      },
    }],
  };
});
