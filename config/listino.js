/**
 * MATRICE PREZZI — Listino Servizi "Il Ponte Pedagogico"
 * Fonte: "Ponte Pedagogico - Listino Servizi Dott.ssa Urboni.pdf"
 *
 * Questo file è la single source of truth del listino: l'interfaccia non
 * contiene prezzi hardcoded, li legge da qui. I servizi e le tariffe arrivano
 * da `config/services.js`, così l'explorer dei servizi, il listino, la
 * prenotazione dei 15 minuti e il form di contatto condividono gli stessi dati.
 *
 * Le tariffe sono esenti IVA (regime forfettario / professione pedagogica).
 */
import { freeIntro, serviceTopics, servicesCatalog, sessionMinutes } from './services.js';

export const listinoMeta = {
  currency: 'EUR',
  locale: 'it-IT',
  sessionMinutes,
  tagline: `Consulenze da ${sessionMinutes} minuti`,
  afterFirstMeetingNote:
    'Dopo il 1° incontro è prevista la relazione con indicazioni specifiche.',
  firstConsultationPrice: servicesCatalog[0].price.first,
  monitoringPrice: servicesCatalog[0].price.followUp,
  freeIntro,
  contact: {
    phone: '347 8901498',
    email: 'noemi.urboni@hotmail.it',
    website: 'www.pontepedagogico.it',
  },
};

/**
 * Matrice prezzi: righe = servizi (da config/services.js), colonne = tipo di
 * incontro. `first` = Prima Consulenza/Valutazione; `followUp` = Monitoraggio.
 */
export const priceMatrix = {
  columns: [
    { key: 'first', label: 'Prima Consulenza', short: 'Primo incontro' },
    { key: 'followUp', label: 'Monitoraggio', short: 'Incontri successivi' },
  ],
  rows: servicesCatalog,
};

/**
 * Pacchetti e agevolazioni famiglia.
 * `value` = valore di listino, `price` = prezzo effettivo, `saving` = sconto.
 */
export const familyPackages = [
  {
    id: 'primi-passi',
    badge: 'Inizio percorso',
    saving: 10,
    title: 'Pacchetto “Primi Passi”',
    tagline: 'Ideale per un primo orientamento e verifiche intermedie.',
    features: [
      '1 Prima Consulenza (60 min)',
      '2 Incontri di Monitoraggio (60 min cad.)',
      'Materiale o scheda di sintesi personalizzata',
    ],
    value: 130,
    price: 120,
    highlight: false,
  },
  {
    id: 'cresciamo-insieme',
    badge: 'Percorso completo',
    saving: 20,
    title: 'Pacchetto “Cresciamo Insieme”',
    tagline:
      'Accompagnamento strutturato per routine 0-3 o potenziamento scolastico.',
    features: [
      '1 Prima Consulenza (60 min)',
      '4 Incontri di Monitoraggio (60 min cad.)',
      'Supporto diretto (WhatsApp/Email) tra gli incontri',
      'Dilazione in 2 rate (in fase iniziale e a metà percorso)',
    ],
    value: 210,
    price: 190,
    highlight: true,
    highlightLabel: 'Più richiesto',
  },
  {
    id: 'carnet-monitoraggio-5',
    badge: 'Abbonamento famiglia',
    saving: 20,
    title: 'Carnet “Monitoraggio 5”',
    tagline:
      'Riservato ai percorsi avviati e condivisibile tra fratelli/sorelle.',
    features: [
      '5 Incontri di Monitoraggio (60 min cad.)',
      'Condivisibile in famiglia (per fratelli o due genitori)',
      'Utilizzabile e pianificabile entro 6 mesi',
    ],
    value: 200,
    price: 180,
    highlight: false,
  },
];

/** Come funziona il servizio — tre passaggi. */
export const serviceSteps = [
  {
    step: 'Primo Contatto & Consulenza',
    text:
      'Durante i 60 minuti della prima consulenza (€50) analizziamo la situazione specifica. Inclusa nel costo, a seguito del primo incontro, verrà rilasciata una relazione scritta con indicazioni pedagogiche specifiche e personalizzate.',
  },
  {
    step: 'Monitoraggio & Attuazione',
    text:
      'Nelle sedute di monitoraggio (€40) valutiamo i progressi, affiniamo gli strumenti educativi e forniamo un costante riscontro al genitore o al ragazzo.',
  },
  {
    step: 'Flessibilità & Trasparenza',
    text:
      'Gli incontri possono svolgersi in presenza o online. Eventuali disdette sono gratuite fino a 24 ore prima dell’appuntamento.',
  },
];

export const listinoNotes = [
  {
    title: 'Agevolazione Percorsi Famiglia & Fratelli',
    text:
      'È possibile concordare pagamenti dilazionati in 2 o 3 soluzioni per i pacchetti, senza costi aggiuntivi.',
  },
  {
    title: 'Detraibilità fiscale e IVA',
    text:
      'La prestazione pedagogica costituisce intervento socio-educativo e consulenza professionale scolastico-formativa. I servizi pedagogici non rientrano tra le prestazioni sanitarie e pertanto non sono detraibili ai fini IRPEF (es. Modello 730 / Spese Mediche e Sanitarie). Le tariffe indicate si intendono esenti IVA ai sensi della normativa vigente per la professione pedagogica (o in regime forfettario).',
  },
  {
    title: 'Fatturazione',
    text:
      'Verrà emessa regolare fattura/ricevuta fiscale per ogni incontro o pacchetto acquistato.',
  },
];

/** Opzioni condivise da form di contatto e prenotazione 15 min. */
export const bookingTopics = [...serviceTopics, 'Altro / Non so ancora'];

export function formatPrice(value) {
  if (!value) return 'Gratuito';
  return new Intl.NumberFormat(listinoMeta.locale, {
    style: 'currency',
    currency: listinoMeta.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
