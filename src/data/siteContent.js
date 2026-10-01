export const contact = {
  whatsappNumber: '393478901498',
  whatsappMessage: 'Ciao Noemi, vorrei ricevere informazioni su una consulenza pedagogica.',
  email: 'noemi.urboni@gmail.com',
  instagramHandle: '@dott.ssa.noemi_pedagogista',
  instagramUrl: 'https://instagram.com/dott.ssa.noemi_pedagogista',
};

export const rotatingWords = [
  'routine più serene',
  'strategie concrete',
  'autonomie possibili',
  'scuola più inclusiva',
];

export const insightCards = [
  {
    label: 'Genitori 0-3',
    title: 'Quando sonno, pasti e routine diventano una lotta',
    text: 'Non sempre serve insistere di più. Capire cosa rende difficile quel momento aiuta a costruire passaggi che tutta la famiglia possa sostenere.',
    service: 'Consulenza 0-3 anni',
  },
  {
    label: 'Scuola 6-18',
    title: 'Quando studiare richiede ogni giorno troppa energia',
    text: 'Capire dove si blocca il processo permette di distinguere la mancanza di metodo da una difficoltà che richiede strumenti diversi.',
    service: 'Supporto allo studio',
  },
  {
    label: 'Neurosviluppo',
    title: 'Quando un comportamento sembra difficile da decifrare',
    text: 'Osservare quando accade, cosa lo precede e cosa comunica può aprire strade più rispettose per sostenere autonomie e relazioni.',
    service: 'Supporto ABA',
  },
];

/**
 * I servizi arrivano dal catalogo unificato (config/services.js): stessa
 * fonte per explorer, listino/tariffe, prenotazione 15 min e contatti.
 */
export { servicesCatalog as services } from '../../config/services.js';

export const methodTabs = [
  {
    id: 'ascolto',
    title: 'Ascolto',
    eyebrow: 'Prima di interpretare',
    text: 'Partiamo da episodi concreti, dalla storia della persona e dai contesti in cui la difficoltà compare davvero.',
  },
  {
    id: 'scientifico',
    title: 'Studio',
    eyebrow: 'Cerchiamo connessioni',
    text: 'Mettiamo in relazione ciò che accade prima, durante e dopo, evitando spiegazioni veloci o giudizi sulla persona.',
  },
  {
    id: 'strumenti',
    title: 'Strumenti',
    eyebrow: 'Una cosa alla volta',
    text: 'La lettura diventa un primo obiettivo osservabile e una strategia abbastanza semplice da entrare nella quotidianità.',
  },
  {
    id: 'autonomia',
    title: 'Autonomia',
    eyebrow: 'Osserviamo il cambiamento',
    text: 'Verifichiamo ciò che funziona, adattiamo ciò che non funziona e costruiamo competenze che possano durare oltre il percorso.',
  },
];

export const credentials = [
  'Laurea Triennale in Scienze dell’Educazione e della Formazione',
  'Laurea Magistrale in Pedagogia',
  'Master di I livello in Analisi del Comportamento Applicata — ABA',
  'Specializzazione e Abilitazione nelle attività di sostegno — Didattica Speciale',
  'Abilitazione all’insegnamento nelle Scuole Secondarie — Filosofia e Scienze Umane',
  'Oltre 7 anni al fianco di bambini neurodivergenti e a sviluppo tipico, tra interventi terapeutici, scuola e privato sociale',
];

export const audience = [
  'Le routine familiari sono diventate fonte di tensione',
  'Un comportamento continua a sembrarti incomprensibile',
  'Studiare richiede ogni giorno troppe energie',
  'Non sai più quale strategia provare',
  'Vuoi sostenere autonomie senza forzare i tempi',
  'Un caso educativo continua a interrogarti',
  'Cerchi una lettura professionale, non una ricetta pronta',
];

export const photoStories = [
  {
    label: 'Percorsi educativi',
    title: 'Quando una routine torna a essere prevedibile',
    text: 'Osservare i passaggi più faticosi permette di capire dove semplificare, anticipare e accompagnare il cambiamento.',
    tone: 'rose',
    image: '/bambini-gioco.webp',
    alt: 'Bambini durante un’attività di gioco educativo',
  },
  {
    label: 'Attività e relazione',
    title: 'Quando una strategia entra davvero nella vita di casa',
    text: 'Un’indicazione diventa utile solo quando la famiglia riesce a riconoscerla, applicarla e adattarla nei momenti reali.',
    tone: 'sage',
    image: '/gioco-bambini-1.jpg',
    alt: 'Bambini impegnati in un’attività educativa',
  },
];

export const caseStudies = [
  {
    tag: 'Caso studio',
    metric: '6 settimane',
    title: 'Dal comportamento problema a una richiesta chiara',
    text: 'Osservazione del contesto, strategia condivisa con la famiglia e monitoraggio dei passaggi più critici.',
  },
  {
    tag: 'Caso studio',
    metric: '4 incontri',
    title: 'Metodo di studio più autonomo',
    text: 'Mappa delle difficoltà, strumenti pratici e micro-obiettivi per rendere il lavoro scolastico sostenibile.',
  },
];

export const reviews = [
  {
    quote: 'Ci siamo sentiti ascoltati e finalmente con indicazioni pratiche da applicare nella routine.',
    name: 'Genitore, percorso 0-3',
  },
  {
    quote: 'Il confronto ci ha aiutati a leggere meglio il bisogno del bambino e a essere più coerenti.',
    name: 'Famiglia, parent coaching',
  },
  {
    quote: 'Strategie chiare, rispettose e molto concrete anche per il contesto scolastico.',
    name: 'Insegnante, supervisione',
  },
];
