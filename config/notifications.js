/**
 * NOTIFICHE APPUNTAMENTI — webhook + email (Resend).
 *
 * Questi valori sono FALLBACK, usati solo dalle Edge Functions (mai spediti al
 * browser). La via consigliata è configurare le variabili d'ambiente su Vercel:
 *
 *   BOOKING_WEBHOOK_URL      indirizzo del webhook (dove arrivano gli eventi)
 *   BOOKING_WEBHOOK_SECRET   segreto opzionale -> header Authorization: Bearer
 *   RESEND_API_KEY           chiave API Resend per le email
 *   BOOKING_NOTIFY_EMAIL     destinatari email (più indirizzi separati da virgola)
 *   BOOKING_FROM_EMAIL       mittente email (opzionale)
 *
 * Se preferisci un file, compila qui sotto le stesse voci.
 */

export const notificationsConfig = {
  // 🌐 Inserisci qui l'indirizzo del webhook, es. "https://hook.eu2.make.com/xxxxx"
  webhookUrl: '',
  // 🔐 Segreto opzionale inviato come "Authorization: Bearer <segreto>"
  webhookSecret: '',
  // Timeout della chiamata webhook (ms)
  webhookTimeoutMs: 8000,

  // ✉️ Destinatari email (più indirizzi separati da virgola)
  emailTo: '',
  // Destinatari del form di contatto (se vuoto usa emailTo)
  contactEmailTo: '',
  // Mittente email: con Resend di test usa onboarding@resend.dev
  emailFrom: 'Il Ponte Pedagogico <onboarding@resend.dev>',
};
