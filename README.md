# Il Ponte Pedagogico — React Dynamic Landing v2

## SEO e indicizzazione

Il dominio canonico è **https://pontepedagogico.it**, definito in `config/seo.js`.
`npm run build` genera HTML con contenuti e metadati già presenti, `dist/sitemap.xml`
e `dist/robots.txt`. `npm run check:seo` verifica gli artefatti della build.
Le anteprime Open Graph e Twitter usano `public/og-image.png` (1200 × 630).

La sitemap contiene la home e cinque approfondimenti reali, collegati dalla sezione servizi:

- `/consulenza-genitoriale`
- `/consulenza-pedagogica-0-3-anni`
- `/supporto-aba`
- `/supporto-allo-studio`
- `/pedagogista-milano-online`

I testi degli approfondimenti sono in `config/seo-pages.js`; le FAQ sono in
`config/seo.js`, condivise con i dati strutturati per mantenere le risposte coerenti.
Le parole chiave sono inserite nei testi pertinenti, senza meta keywords o pagine
che reindirizzano alla home. I riferimenti geografici descrivono le consulenze
online e in presenza confermate; non viene dichiarato un servizio a domicilio.

`/appuntamenti` e la pagina 404 hanno `noindex` nell’HTML iniziale. L’area
appuntamenti resta scansionabile per consentire la lettura di questa direttiva.
`noindex` non sostituisce l’autenticazione dell’area riservata. Le API sono escluse
dalla scansione. Vercel usa URL senza `.html` e una vera pagina 404, senza il
precedente rewrite universale alla home; le API continuano a usare le funzioni Vercel.

Con `VITE_COMING_SOON=true` la home resta `noindex`, gli approfondimenti non sono
indicizzabili e la sitemap non contiene URL. Per il sito pubblico lasciare il flag
vuoto o impostarlo a `false` e ricostruire il sito.

Dopo il deploy, verificare le risposte HTTP di `/sitemap.xml`, `/robots.txt` e dei
cinque approfondimenti; in Google Search Console inviare `sitemap.xml` ed eseguire
Ispezione URL sulla home e sulle nuove pagine. La verifica Search Console già
configurata sul dominio non viene modificata. I dati FAQ non garantiscono risultati
avanzati: Google ne limita la visualizzazione. Misurare impressioni, clic e query
dopo l’indicizzazione; la configurazione SEO non garantisce posizioni specifiche.

Versione **dinamica e più coinvolgente** della landing per la Dott.ssa Noemi Urboni.

## Cosa cambia rispetto alla versione base

- Hero completamente riprogettata con headline animata e pannello narrativo.
- Barra di progresso scroll in alto.
- Selettore interattivo dei bisogni: genitori, scuola, neurosviluppo, professionisti.
- Explorer servizi con filtri, dettaglio dinamico e CTA contestuali.
- Sezione metodo in stile “bussola” con tab interattivi.
- Percorso in 3 step con micro-copy orientato alla conversione.
- Form che aggiorna il servizio selezionato in base alle CTA cliccate.
- **Un'unica sezione** (`#servizi`) con servizi, tariffe (dal PDF) e pacchetti inclusi.
- **Sezione finale `#contatti`**: prenotazione 15 min (calendario settimanale, week by week) e form di contatto, in due tab.
- Pannello **`/appuntamenti`** con storico ed eventi verso **webhook** + **email Resend**.
- **Form di contatto** che invia via **Resend** (fallback `mailto` in locale).
- **Servizi, tariffe, 15 minuti e contatti unificati** in `config/services.js`.
- Scroll-trigger del metodo **centrato** con animazioni fluide e sizing **viewport-relative** (vh/vw).
- WhatsApp flottante con messaggio precompilato.
- Animazioni CSS + IntersectionObserver, senza librerie extra.

## Novità v2.1 — Sezione unificata Servizi/Tariffe/Prenotazione

### 1. Sezione unificata (`#servizi`)

La sezione **`#servizi`** (`ServiceHub`) contiene **servizi con tariffe e pacchetti
famiglia**. Non esiste più la sezione `#listino` separata. In fondo alla pagina, la
sezione **`#contatti`** (`ContactBooking`) raccoglie **prenotazione 15 minuti e form
di contatto** in due tab: `#prenota` apre il tab prenotazione.

Tariffe e servizi sono **unificati** in un'unica fonte: `config/services.js` (catalogo
servizi con `price` per ciascuno). Da lì derivano l’explorer dei servizi, il listino,
l’opzione “15 minuti” e il selettore del form di contatto. Le tariffe base seguono il PDF
**“Ponte Pedagogico - Listino Servizi Dott.ssa Urboni”** (prima consulenza €50, monitoraggio €40).

- **Catalogo servizi** (`servicesCatalog`): 5 servizi, ognuno con descrizione, `promise`,
  `goodFor`, `steps` e `price` {prima €50, monitoraggio €40}.
- **Matrice prezzi** (`priceMatrix`): deriva dal catalogo (`priceMatrix.rows === servicesCatalog`).
- **Intro gratuita** (`freeIntro`): incontro conoscitivo di 15 minuti, agganciato a servizi,
  listino e contatti.
- **Pacchetti famiglia** (`familyPackages`): “Primi Passi” €120 (valore €130),
  “Cresciamo Insieme” €190 (valore €210), Carnet “Monitoraggio 5” €180 (valore €200).
- La CTA dei pacchetti porta direttamente alla prenotazione.

Per aggiornare prezzi o descrizioni basta modificare `config/services.js`: nessun importo è
hardcoded nel componente.

### 2. Prenotazione 15 minuti gratuiti (tab “Prenota 15 min” in `#contatti`, in fondo)

> Prenotazione e contatti convivono nella sezione finale `#contatti`; l’anchor
> `#prenota` apre il tab prenotazione, il tab “Scrivimi” mostra il form.

- **Vista settimanale** (lun–dom) con **scorrimento settimana per settimana**
  (frecce ‹ ›, swipe su touch, pulsante “Questa settimana”, massimo 8 settimane).
- Slot di **15 minuti** generati dalla **matrice orari** in `config/schedule.js`.
- Stato slot: disponibile / prenotato / non prenotabile, con legenda e fuso orario.
- Form di conferma (nome, email, telefono, motivo, note, consenso) e schermata di
  successo con codice di riferimento e download **.ics** (“Aggiungi al calendario”).
- Fallback automatico: se `/api/availability` non è raggiungibile (es. `vite dev`
  senza backend) la UI mostra l’anteprima locale e completa la richiesta su WhatsApp.

### 3. Matrice orari (`config/schedule.js`)

Single source of truth condivisa tra frontend ed Edge Functions:

```js
scheduleConfig = {
  timezone: 'Europe/Rome',
  slotMinutes: 15,
  minNoticeHours: 2,
  bookingWeeksAhead: 8,
  weekly: { 1: [...], ..., 7: null }, // finestre per giorno ISO (1=Lun)
  blackoutDates: [],   // festività / ferie
  dateOverrides: {},   // override per singola data
  weekdaysClosed: [],
}
```

Espone helpers puri (senza dipendenze): `getSlotsForDate`, `isSlotBookable`,
`isSlotPast`, `weekDates`, `mondayOf`, `formatWeekLabel`, ecc.

### 4. Vercel Edge Functions (`api/`)

| Endpoint           | Metodo | Descrizione                                              |
| ------------------ | ------ | -------------------------------------------------------- |
| `/api/availability`| GET    | Disponibilità per `from` (lunedì) e `weeks` (1…8)        |
| `/api/book`        | POST   | Prenota uno slot (validazione + riserva atomica)         |
| `/api/bookings`    | GET    | Storico completo degli appuntamenti                      |
| `/api/bookings`    | POST   | Reinvia l’evento di un appuntamento (webhook / email)    |
| `/api/contact`     | POST   | Invia il form di contatto via Resend                     |

- `api/_store.js` usa un database Redis compatibile con l’API REST di Upstash
  (Vercel KV / Upstash / Redis) tramite `fetch`.
- La prenotazione usa `SET ... NX` per evitare il doppio appuntamento (HTTP 409).
- **Fallback in-memory** se le env non sono configurate: comodo in sviluppo, ma
  **non affidabile in produzione** (le isolate Edge non condividono memoria).

### 5. Area appuntamenti `/appuntamenti` + notifiche

Pannello interno con **storico** di tutte le prenotazioni, diviso in “In arrivo”
/ “Passati”. Per ogni appuntamento:

- scheda con data/ora, nome, email, telefono, motivo, note, codice e data richiesta;
- pulsanti **“Invia webhook”** e **“Invia email”** per re-inviare l’evento;
- stato dei canali (webhook configurato/non, destinatari email, tipo di store).

Alla creazione di una prenotazione (`POST /api/book`) l’evento parte
**automaticamente** verso tutti i canali configurati.

**Evento webhook** (POST JSON):

```json
{
  "event": "appointment.created",
  "sentAt": "2026-10-01T12:00:00.000Z",
  "appointment": { "code": "PP-XXXXXX", "date": "2026-10-08", "time": "11:00", "name": "…", "email": "…", "phone": "…", "topic": "…", "notes": "…", "timezone": "Europe/Rome" }
}
```

Header inviati: `x-ponte-event: appointment.created` (o `appointment.resent`) e,
se configurato il segreto, `Authorization: Bearer <segreto>`.

### 📍 Dove inserire l’indirizzo del webhook

Aggiungilo come **variabile d’ambiente su Vercel** (consigliato):

```txt
BOOKING_WEBHOOK_URL=https://hook.eu2.make.com/xxxxxxxx
BOOKING_WEBHOOK_SECRET=una-stringa-segreta   # opzionale
```

Oppure, se preferisci un file, compila il campo `webhookUrl` in
`config/notifications.js` (usato come fallback). Lo stesso file contiene i
fallback per le email.

### 6. Form di contatto con Resend (tab “Scrivimi” in `#contatti`, in fondo)

Il form invia i dati a `POST /api/contact` (Edge Function) che
spedisce un’email via **Resend** ai destinatari configurati, impostando il
visitatore come `reply_to` (rispondendo si scrive direttamente a lui). In
assenza di backend configurato (es. `vite dev`), il form ricade
sull’apertura del client email con il messaggio precompilato.

```txt
CONTACT_NOTIFY_EMAIL=noemi.urboni@hotmail.it   # fallback: BOOKING_NOTIFY_EMAIL
CONTACT_FROM_EMAIL="Il Ponte Pedagogico <contatti@tuodominio.it>"  # fallback: BOOKING_FROM_EMAIL
```

## Modalità “in arrivo” (coming soon)

Per pubblicare una pagina di attesa al posto della landing (utile durante la
manutenzione) basta una variabile d’ambiente:

```txt
VITE_COMING_SOON=true
```

- Prefisso **`VITE_`** obbligatorio: Vite incorpora il valore nel bundle **al
  momento della build**, quindi dopo la modifica serve un **nuovo deploy** (su
  Vercel: Settings → Environment Variables, poi Redeploy).
- Valori accettati come “attivo”: `true`, `1`, `yes`, `on`, `sì`. Qualsiasi altro
  valore (o vuoto) mantiene il sito normale.
- La pagina mostra comunque WhatsApp, email e Instagram, così le richieste non
  si perdono durante l’attesa, e imposta `noindex` per non farsi indicizzare.
- Il pannello interno **`/appuntamenti`** resta sempre raggiungibile.
- Per rivedere la landing in locale: `VITE_COMING_SOON=false npm run dev`.

Implementazione: `src/config/flags.js` (flag) e `src/pages/ComingSoon.jsx`
(pagina); l’attivazione è gestita in `src/App.jsx`.

## Configurazione store prenotazioni

Lo store di **default è Redis**: in produzione/preview le Edge Functions lo
richiedono (la memoria per-isolate non è affidabile). La memoria resta solo per
lo sviluppo locale, oppure forzandola con `BOOKING_STORE=memory`
(`BOOKING_STORE=redis` per richiedere Redis esplicitamente).

Imposta **una** delle seguenti coppie di variabili d’ambiente su Vercel
(Project → Settings → Environment Variables):

```txt
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
# oppure
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Notifiche webhook + email

```txt
# Webhook appuntamenti (Make, Zapier, n8n, ...)
BOOKING_WEBHOOK_URL=...
BOOKING_WEBHOOK_SECRET=...

# Email tramite Resend (https://resend.com)
RESEND_API_KEY=...
BOOKING_NOTIFY_EMAIL=noemi.urboni@hotmail.it   # prenotazioni, più indirizzi con virgola
CONTACT_NOTIFY_EMAIL=noemi.urboni@hotmail.it   # form di contatto (fallback: BOOKING_NOTIFY_EMAIL)
BOOKING_FROM_EMAIL="Il Ponte Pedagogico <prenotazioni@tuodominio.it>"  # opzionale
CONTACT_FROM_EMAIL="Il Ponte Pedagogico <contatti@tuodominio.it>"      # opzionale
```

### Protezione pannello `/appuntamenti`

Login con **nome utente + password**:

```txt
ADMIN_USERNAME=noemi
ADMIN_PASSWORD=una-password-lunga
ADMIN_SESSION_SECRET=...        # opzionale (default: la password)
ADMIN_SESSION_HOURS=12          # durata sessione (default 12h)
```

Il login avviene su `POST /api/admin-login`, che valida le credenziali e rilascia
un **token di sessione firmato (HMAC)** con scadenza: il browser non conserva la
password. `/api/bookings` accetta il token via header `x-admin-token` o
`Authorization: Bearer`, oppure **Basic Auth**, oppure il vecchio
`ADMIN_ACCESS_TOKEN` (header `x-admin-token`, utile per uso API).

Se **nessuna** di queste variabili è impostata, lo storico è accessibile a
chiunque: usalo quindi **solo** in sviluppo o configura sempre le credenziali in
produzione. Vedi `.env.example` per l’elenco completo.

## Avvio

```bash
npm install
npm run dev        # frontend (API in fallback locale)
```

Per testare le Edge Functions in locale:

```bash
npx vercel dev
```

## Build

```bash
npm run build
```

## Personalizzazione rapida

- Testi e contatti: `src/data/siteContent.js`
- **Servizi + tariffe (fonte unica)**: `config/services.js`
- Prezzi derivati e pacchetti: `config/listino.js`
- Orari e regole di prenotazione: `config/schedule.js`
- Webhook/email (fallback): `config/notifications.js`
- Variabili d’ambiente: copia `.env.example` in `.env.local`
- Pagina “in arrivo”: `src/pages/ComingSoon.jsx` (flag `VITE_COMING_SOON` in `src/config/flags.js`)

## Deploy

Compatibile con Vercel (consigliato: `api/` come Edge Functions), Netlify,
Cloudflare Pages o qualunque hosting statico dopo `npm run build`.
