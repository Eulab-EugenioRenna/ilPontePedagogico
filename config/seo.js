import { servicesCatalog } from './services.js';
import { findSeoPage } from './seo-pages.js';

export const siteUrl = 'https://pontepedagogico.it';
export const siteName = 'Il Ponte Pedagogico';
export const homeTitle = 'Pedagogista online e a Milano | Il Ponte Pedagogico';
export const homeDescription = 'Noemi Urboni: consulenza genitoriale, routine 0-3 anni, supporto ABA e allo studio. Online e in presenza a Cassina de’ Pecchi, Cernusco e provincia di Milano.';
export const serviceArea = 'Consulenza pedagogica online e in presenza a Cassina de’ Pecchi, Cernusco sul Naviglio e nella provincia di Milano.';

// Domande e risposte usate sia nella pagina sia nei dati strutturati.
export const faqs = [
  {
    question: 'Quando può aiutarmi una consulenza genitoriale?',
    answer: 'Quando i conflitti si ripetono, le regole diventano motivo di tensione o ti senti in difficoltà nel ruolo di genitore. Il parent coaching offre supporto ai genitori e sostegno alla genitorialità: partiamo da episodi concreti per costruire scelte educative più consapevoli e coerenti.',
  },
  {
    question: 'Mio figlio non vuole rispettare le regole: da dove iniziare?',
    answer: 'Nella consulenza educativa osserviamo quali richieste risultano difficili, quando nasce il conflitto e come rispondono gli adulti. Questa lettura permette di scegliere regole comprensibili e strategie sostenibili, tenendo conto dell’età e dei bisogni del bambino.',
  },
  {
    question: 'Come affrontare i capricci a 2 anni e le difficoltà nelle routine 0-3 anni?',
    answer: 'La consulenza pedagogica per la prima infanzia aiuta a leggere i momenti di fatica legati a pasti, separazioni e prime autonomie. Per la gestione dei capricci osserviamo cosa accade prima, durante e dopo, poi concordiamo piccoli cambiamenti da provare nella routine familiare.',
  },
  {
    question: 'Mio figlio non vuole dormire: possiamo lavorare sulla routine della nanna?',
    answer: 'Possiamo osservare insieme i passaggi che precedono l’addormentamento, le abitudini familiari e i momenti di separazione. Il percorso educativo 0-3 anni aiuta a costruire una routine della nanna più prevedibile, rispettando i tempi del bambino e le possibilità della famiglia.',
  },
  {
    question: 'Che cosa significa supporto ABA e analisi del comportamento applicata?',
    answer: 'L’analisi del comportamento applicata (ABA) aiuta a mettere in relazione comportamento e contesto. Nel sostegno ai disturbi del neurosviluppo definiamo obiettivi osservabili per accompagnare la gestione dei comportamenti problema, l’autonomia, la comunicazione e il potenziamento delle abilità sociali.',
  },
  {
    question: 'Mio figlio ha difficoltà di concentrazione e non vuole fare i compiti: come aiutarlo?',
    answer: 'Il supporto allo studio parte da ciò che rende faticosi i compiti e l’apprendimento. Lavoriamo su strategie di studio, organizzazione del lavoro e autonomia nello studio, cercando un metodo personale per bambini e ragazzi. Il percorso pedagogico non sostituisce una valutazione diagnostica delle difficoltà di apprendimento.',
  },
  {
    question: 'Posso rivolgermi a una pedagogista online?',
    answer: 'Sì, Noemi Urboni offre consulenza pedagogica online. Un primo incontro conoscitivo gratuito di 15 minuti permette di raccontare il bisogno e capire quale percorso educativo approfondire.',
  },
  {
    question: 'Dove si svolgono le consulenze pedagogiche in presenza?',
    answer: 'Le consulenze in presenza sono disponibili a Cassina de’ Pecchi, Cernusco sul Naviglio e nella provincia di Milano. Puoi scrivere a Noemi per concordare la sede e la modalità dell’incontro.',
  },
];

export function pageSeo(pathname = '/', comingSoon = false) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/appuntamenti') return {
    title: 'Area appuntamenti | Il Ponte Pedagogico',
    description: 'Area riservata per la gestione degli appuntamenti de Il Ponte Pedagogico.',
    path, indexable: false,
  };
  const page = findSeoPage(path);
  if (page && !comingSoon) return { title: page.title, description: page.description, path, indexable: true, page };
  if (path !== '/') return {
    title: 'Pagina non trovata | Il Ponte Pedagogico',
    description: 'Questa pagina non è disponibile. Visita Il Ponte Pedagogico per scoprire i percorsi educativi.',
    path: '/404', indexable: false,
  };
  if (comingSoon) return {
    title: 'Il Ponte Pedagogico — In arrivo',
    description: 'Il nuovo sito della Dott.ssa Noemi Urboni è in arrivo. Contattami per informazioni sui percorsi pedagogici.',
    path: '/', indexable: false,
  };
  return { title: homeTitle, description: homeDescription, path: '/', indexable: true };
}

export function structuredData(contact, seo = pageSeo()) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', '@id': `${siteUrl}/#noemi-urboni`,
        name: 'Noemi Urboni', honorificPrefix: 'Dott.ssa', jobTitle: 'Pedagogista',
        url: `${siteUrl}/`, image: `${siteUrl}/noemi-6.png`,
        email: contact.email, sameAs: [contact.instagramUrl],
      },
      {
        '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: siteName,
        url: `${siteUrl}/`, inLanguage: 'it-IT',
        publisher: { '@id': `${siteUrl}/#noemi-urboni` },
      },
      {
        '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, name: homeTitle,
        description: homeDescription, url: `${siteUrl}/`, inLanguage: 'it-IT',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#noemi-urboni` },
      },
      ...servicesCatalog.map((service) => ({
        '@type': 'Service', '@id': `${siteUrl}/#servizio-${service.id}`,
        name: service.title, description: service.short,
        url: `${siteUrl}/#servizi`, provider: { '@id': `${siteUrl}/#noemi-urboni` },
        areaServed: ['Cassina de’ Pecchi', 'Cernusco sul Naviglio', 'Provincia di Milano'],
        availableChannel: { '@type': 'ServiceChannel', serviceUrl: `${siteUrl}/#contatti` },
      })),
      {
        '@type': 'FAQPage', '@id': `${siteUrl}/#domande-frequenti`,
        mainEntity: faqs.map(({ question, answer }) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
  if (!seo.page) return data;
  const url = `${siteUrl}${seo.path}`;
  data['@graph'] = [
    ...data['@graph'].filter((node) => ['Person', 'WebSite'].includes(node['@type'])),
    {
      '@type': 'WebPage', '@id': `${url}#webpage`, name: seo.title,
      description: seo.description, url, inLanguage: 'it-IT',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': seo.page.serviceId ? `${siteUrl}/#servizio-${seo.page.serviceId}` : `${siteUrl}/#noemi-urboni` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    },
    ...data['@graph'].filter((node) => node['@id'] === `${siteUrl}/#servizio-${seo.page.serviceId}`),
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: siteName, item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: seo.page.label, item: url },
      ],
    },
    {
      '@type': 'FAQPage', '@id': `${url}#domande-frequenti`,
      mainEntity: seo.page.faqIndexes.map((index) => ({
        '@type': 'Question', name: faqs[index].question,
        acceptedAnswer: { '@type': 'Answer', text: faqs[index].answer },
      })),
    },
  ];
  return data;
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

export function renderSeoHead(seo, contact) {
  const meta = (kind, key, value) => `<meta data-site-seo ${kind}="${key}" content="${escapeHtml(value)}" />`;
  return [
    `<title data-site-seo>${escapeHtml(seo.title)}</title>`,
    meta('name', 'description', seo.description),
    meta('name', 'author', 'Dott.ssa Noemi Urboni'),
    meta('name', 'robots', seo.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'),
    ...(seo.indexable ? [`<link data-site-seo rel="canonical" href="${siteUrl}${seo.path}" />`] : []),
    meta('property', 'og:locale', 'it_IT'),
    meta('property', 'og:site_name', siteName),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    meta('property', 'og:url', `${siteUrl}${seo.path}`),
    meta('property', 'og:image', `${siteUrl}/og-image.png`),
    meta('property', 'og:image:secure_url', `${siteUrl}/og-image.png`),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', 'Il Ponte Pedagogico — Dott.ssa Noemi Urboni, consulenza pedagogica e supporto ai genitori'),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', `${siteUrl}/og-image.png`),
    meta('name', 'twitter:image:alt', 'Il Ponte Pedagogico — Dott.ssa Noemi Urboni'),
    ...(seo.indexable ? [`<script data-site-seo type="application/ld+json">${JSON.stringify(structuredData(contact, seo)).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ');
}
