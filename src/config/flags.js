/**
 * Flag di build lette dalle variabili d'ambiente di Vite (`VITE_*`).
 *
 * Vite sostituisce `import.meta.env.VITE_*` al momento della build: per attivare
 * una modalità basta definire la variabile su Vercel (o in `.env.local`) e
 * ridistribuire/riavviare il sito. Non sono lette a runtime dal browser.
 */

const TRUTHY = new Set(['1', 'true', 'yes', 'y', 'on', 'si', 'sì']);

function readBoolean(value) {
  return typeof value === 'string' && TRUTHY.has(value.trim().toLowerCase());
}

/**
 * `true` quando la landing pubblica è sostituita dalla pagina "in arrivo".
 * Attiva con `VITE_COMING_SOON=true` (accetta anche `1`, `yes`, `on`, `sì`).
 * Il pannello interno `/appuntamenti` resta sempre raggiungibile.
 */
export const comingSoon = readBoolean(import.meta.env?.VITE_COMING_SOON);

/** Alias leggibile usato nei componenti: `if (flags.comingSoon) …`. */
export const flags = { comingSoon };
