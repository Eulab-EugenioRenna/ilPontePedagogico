import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { faqs, pageSeo, siteUrl } from '../config/seo.js';
import { seoPages } from '../config/seo-pages.js';

const home = await readFile('dist/index.html', 'utf8');
const appointments = await readFile('dist/appuntamenti.html', 'utf8');
const notFound = await readFile('dist/404.html', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const comingSoon = home.includes('content="noindex, nofollow"');

for (const html of [home, appointments, notFound]) {
  assert.equal((html.match(/<title\b/g) || []).length, 1, 'Un solo titolo');
  assert.equal((html.match(/name="description"/g) || []).length, 1, 'Una sola descrizione');
  assert.equal((html.match(/name="robots"/g) || []).length, 1, 'Una sola direttiva robots');
  assert.ok(!html.includes('<div id="root"></div>'), 'HTML con contenuti prerenderizzati');
  assert.ok(html.includes(`${siteUrl}/og-image.png`), 'URL assoluto dell’anteprima');
  assert.ok(!html.includes('name="keywords"'), 'Nessun meta keywords inutile');
}
for (const html of [appointments, notFound]) {
  assert.ok(html.includes('content="noindex, nofollow"'));
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(!html.includes('application/ld+json'));
}
assert.ok(appointments.includes('Area appuntamenti'));
assert.ok(notFound.includes('Pagina non trovata'));
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
assert.ok(!robots.includes('Disallow: /appuntamenti'), 'Noindex deve essere scansionabile');
assert.ok(!sitemap.includes('/appuntamenti'));
assert.ok(!sitemap.includes('#'));

if (!comingSoon) {
  assert.ok(home.includes(`rel="canonical" href="${siteUrl}/"`));
  assert.ok(home.includes(pageSeo().title));
  const schema = JSON.parse(home.match(/<script data-site-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faqSchema = schema['@graph'].find((node) => node['@type'] === 'FAQPage');
  assert.equal(faqSchema.mainEntity.length, faqs.length);
  for (const { question, answer } of faqs) {
    assert.ok(home.includes(question), `Domanda visibile: ${question}`);
    assert.ok(home.includes(answer), `Risposta presente nell’HTML: ${question}`);
  }
  assert.ok(sitemap.includes(`<loc>${siteUrl}/</loc>`));
  assert.equal((sitemap.match(/<loc>/g) || []).length, seoPages.length + 1);
  for (const page of seoPages) {
    const html = await readFile(`dist/${page.path.slice(1)}.html`, 'utf8');
    assert.ok(html.includes(`rel="canonical" href="${siteUrl}${page.path}"`));
    assert.ok(html.includes(page.heading));
    assert.ok(!html.includes('content="noindex'));
    assert.ok(sitemap.includes(`<loc>${siteUrl}${page.path}</loc>`));
    assert.ok(home.includes(`href="${page.path}"`));
    const data = JSON.parse(html.match(/<script data-site-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage');
    assert.equal(faq.mainEntity.length, page.faqIndexes.length);
    for (const index of page.faqIndexes) assert.ok(html.includes(`<summary>${faqs[index].question}</summary>`));
    for (const node of data['@graph']) {
      if (node['@type'] === 'WebPage') assert.equal(node.url, `${siteUrl}${page.path}`);
    }
  }
} else {
  assert.ok(!sitemap.includes('<loc>'));
  assert.ok(!home.includes('application/ld+json'));
}

const image = await readFile('dist/og-image.png');
assert.equal(image.subarray(1, 4).toString(), 'PNG');
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.log(`SEO verificata: HTML, metadati, anteprime, sitemap, robots e noindex (${comingSoon ? 'in arrivo' : 'pubblico'}).`);
