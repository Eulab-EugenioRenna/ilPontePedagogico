# Il Ponte Pedagogico — React Dynamic Landing v2

Versione **dinamica e più coinvolgente** della landing per la Dott.ssa Noemi Urboni.

## Cosa cambia rispetto alla versione base

- Hero completamente riprogettata con headline animata e pannello narrativo.
- Barra di progresso scroll in alto.
- Selettore interattivo dei bisogni: genitori, scuola, neurosviluppo, professionisti.
- Explorer servizi con filtri, dettaglio dinamico e CTA contestuali.
- Sezione metodo in stile “bussola” con tab interattivi.
- Percorso in 3 step con micro-copy orientato alla conversione.
- Form che aggiorna il servizio selezionato in base alle CTA cliccate.
- WhatsApp flottante con messaggio precompilato.
- Animazioni CSS + IntersectionObserver, senza librerie extra.

## Avvio

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Personalizzazione rapida

Modifica i dati in:

```txt
src/data/siteContent.js
```

Campi principali:

- `whatsappNumber`
- `email`
- `instagramUrl`
- servizi e testi
- messaggi CTA

## Deploy

Compatibile con Vercel, Netlify, Cloudflare Pages o qualunque hosting statico dopo `npm run build`.
