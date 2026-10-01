/**
 * CATALOGO SERVIZI — unica fonte di verità.
 *
 * Unifica:
 *  - i servizi mostrati nell'explorer (`src/components/ServiceExplorer.jsx`),
 *  - le tariffe del listino (`config/listino.js` / sezione Prezzi),
 *  - le opzioni di "Area di interesse" del form di contatto,
 *  - i motivi selezionabili nella prenotazione dei 15 minuti.
 *
 * Modificando qui titoli, descrizioni o `price`, si aggiorna l'intero sito.
 * Le tariffe sono esenti IVA (professione pedagogica / regime forfettario).
 */

export const sessionMinutes = 60;

export const servicesCatalog = [
  {
    id: 'zero-tre',
    area: 'Genitorialità',
    title: 'Consulenza Pedagogica 0-3 anni',
    short:
      'Per capire cosa rende faticosi sonno, pasti, separazioni e prime autonomie, senza affidarsi a tentativi casuali.',
    promise:
      'Leggere meglio i bisogni dei primi anni e costruire routine che la famiglia riesca davvero a sostenere.',
    goodFor: ['Le routine diventano scontri', 'Non sai più quale tentativo fare', 'Sonno o pasti preoccupano'],
    steps: ['Ricostruiamo i momenti critici', 'Individuiamo il primo cambiamento', 'Osserviamo e adattiamo la routine'],
    cta: 'Parlami della tua routine',
    firstLabel: 'Prima Consulenza',
    followUpLabel: 'Incontro di Monitoraggio',
    price: { first: 50, followUp: 40 },
  },
  {
    id: 'parent-coaching',
    area: 'Genitorialità',
    title: 'Parent Coaching',
    short:
      'Per leggere con maggiore chiarezza comportamenti, conflitti e momenti educativi in cui ogni risposta sembra peggiorare la situazione.',
    promise: 'Passare dal “non so più cosa fare” a scelte educative più consapevoli e coerenti.',
    goodFor: ['I conflitti si ripetono', 'Le regole non sembrano funzionare', 'Vuoi ritrovare coerenza educativa'],
    steps: ['Partiamo da episodi concreti', 'Comprendiamo cosa mantiene la difficoltà', 'Proviamo risposte nuove nel quotidiano'],
    cta: 'Capisci da dove iniziare',
    firstLabel: 'Prima Consulenza',
    followUpLabel: 'Incontro di Monitoraggio',
    price: { first: 50, followUp: 40 },
  },
  {
    id: 'aba',
    area: 'Sviluppo e inclusione',
    title: 'Sportello Sostegno Disturbi del Neurosviluppo',
    short:
      'Per comprendere comportamenti e bisogni legati al neurosviluppo e sostenere autonomie, comunicazione e abilità sociali.',
    promise:
      'Costruire competenze utili nella vita reale, rispettando tempi, unicità e contesto della persona.',
    goodFor: ['Un comportamento è difficile da leggere', 'Servono obiettivi osservabili', 'Vuoi sostenere nuove autonomie'],
    steps: ['Osserviamo contesto e comportamento', 'Definiamo obiettivi significativi', 'Portiamo le competenze nella vita reale'],
    cta: 'Raccontami cosa osservi',
    firstLabel: 'Prima Consulenza',
    followUpLabel: 'Incontro di Monitoraggio',
    price: { first: 50, followUp: 40 },
  },
  {
    id: 'studio',
    area: 'Sviluppo e inclusione',
    title: 'Orientamento Scolastico e Supporto allo Studio',
    short:
      'Per capire perché lo studio assorbe troppe energie e trovare un metodo coerente con il modo di apprendere dello studente.',
    promise: 'Aiutare bambini e ragazzi a ritrovare direzione, metodo e fiducia nelle proprie possibilità.',
    goodFor: ['Studiare richiede tempi eccessivi', 'Manca un metodo stabile', 'La scelta scolastica crea incertezza'],
    steps: ['Individuiamo dove nasce la fatica', 'Costruiamo un metodo personale', 'Rendiamo lo studente più autonomo'],
    cta: 'Parlami della difficoltà',
    firstLabel: 'Prima Valutazione',
    followUpLabel: 'Sessione di Monitoraggio',
    price: { first: 50, followUp: 40 },
  },
  {
    id: 'supervisione',
    area: 'Professionisti',
    title: 'Supervisione Pedagogica',
    short:
      'Uno spazio di confronto per rileggere casi complessi, dinamiche del gruppo e interventi che non stanno producendo il cambiamento atteso.',
    promise:
      'Uscire dal confronto con una lettura più chiara del caso e nuove ipotesi operative da verificare.',
    goodFor: ['Un caso continua a interrogarti', 'Il gruppo-classe è difficile da gestire', 'Le strategie provate non bastano'],
    steps: ['Ricostruiamo il caso', 'Formuliamo nuove ipotesi di lettura', 'Definiamo cosa osservare e provare'],
    cta: 'Porta il tuo caso',
    firstLabel: 'Prima Consulenza',
    followUpLabel: 'Incontro di Monitoraggio',
    price: { first: 50, followUp: 40 },
  },
];

/** Incontro conoscitivo gratuito di 15 minuti (agganciato a tutti i servizi). */
export const freeIntro = {
  id: 'intro-15-min',
  title: 'Incontro conoscitivo 15 min',
  durationMinutes: 15,
  price: 0,
  free: true,
};

/** Etichette per i select di contatto e prenotazione. */
export const serviceTopics = [
  ...servicesCatalog.map((service) => service.title),
  `${freeIntro.title} (gratuito)`,
];
