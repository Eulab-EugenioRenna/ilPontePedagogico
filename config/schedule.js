/**
 * MATRICE ORARI — disponibilità settimanale per le prenotazioni.
 *
 * File condiviso tra la landing (calcolo anteprima / fallback) e le Vercel
 * Edge Functions in `api/` (fonte autorevole). Deve restare puro ESM: nessun
 * accesso a DOM, `process.env`, file system o dipendenze esterne.
 *
 * Ogni giorno della settimana è definito da una lista di finestre
 * [inizio, fine] in orario locale (wall-clock). Dal primo minuto di ogni
 * finestra si generano slot di `slotMinutes` minuti finché uno slot completo
 * non entra nella finestra.
 */

export const scheduleConfig = {
  /** Fuso orario di riferimento (IANA). */
  timezone: 'Europe/Rome',
  /** Durata dell'appuntamento gratuito (minuti). */
  slotMinutes: 15,
  /** Anticipo minimo per poter prenotare (ore). */
  minNoticeHours: 2,
  /** Quante settimane in avanti si possono consultare/prenotare. */
  bookingWeeksAhead: 8,
  /** Durata massima della consulenza gratuita, mostrata in UI. */
  meetingLabel: 'Incontro conoscitivo di 15 minuti',

  /** 1 = Lunedì ... 7 = Domenica. `null` = chiuso. */
  weekly: {
    1: [['09:00', '12:30'], ['14:30', '19:00']],
    2: [['09:00', '12:30'], ['14:30', '19:00']],
    3: [['09:00', '12:30'], ['14:30', '19:00']],
    4: [['09:00', '12:30'], ['14:30', '19:00']],
    5: [['09:00', '12:30'], ['14:30', '18:00']],
    6: [['09:00', '12:30']],
    7: null,
  },

  /** Giorni di chiusura straordinaria (festività, ferie), formato YYYY-MM-DD. */
  blackoutDates: [],

  /**
   * Override puntuali per singola data: sostituiscono la matrice settimanale.
   * Esempio: { '2026-01-07': null } -> chiuso; { '2026-01-07': [['10:00','12:00']] }.
   */
  dateOverrides: {},

  /** Giorni (0=Dom..6=Sab) senza prenotazioni, oltre alla matrice settimanale. */
  weekdaysClosed: [],
};

const WD_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const WD_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTHS = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

/* ------------------------------------------------------------------ */
/* Utility date pure (UTC, nessun fuso)                                */
/* ------------------------------------------------------------------ */

export function parseISODate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso, amount) {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return toISODate(date);
}

/** Indice giorno ISO: 1 = Lun ... 7 = Dom. */
export function isoWeekday(iso) {
  const day = parseISODate(iso).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Lunedì della settimana che contiene `iso`. */
export function mondayOf(iso) {
  return addDays(iso, -(isoWeekday(iso) - 1));
}

export function todayISO() {
  return toISODate(new Date());
}

/* ------------------------------------------------------------------ */
/* Tempo nel fuso di riferimento                                       */
/* ------------------------------------------------------------------ */

/** Restituisce { date: 'YYYY-MM-DD', time: 'HH:mm' } nell'orario di `timeZone`. */
export function nowInTimeZone(timeZone = scheduleConfig.timezone, reference = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(reference);

  const map = {};
  for (const part of parts) map[part.type] = part.value;
  const hour = map.hour === '24' ? '00' : map.hour;
  return { date: `${map.year}-${map.month}-${map.day}`, time: `${hour}:${map.minute}` };
}

/* ------------------------------------------------------------------ */
/* Finestre e slot                                                     */
/* ------------------------------------------------------------------ */

function isClosedDate(dateISO, config) {
  if (config.blackoutDates.includes(dateISO)) return true;
  const wd = isoWeekday(dateISO);
  if (config.weekdaysClosed.includes(wd === 7 ? 0 : wd)) return true;
  return false;
}

/** Finestre valide per una data, applicando override/settimana/chiusure. */
export function getWindowsForDate(dateISO, config = scheduleConfig) {
  if (Object.prototype.hasOwnProperty.call(config.dateOverrides, dateISO)) {
    const override = config.dateOverrides[dateISO];
    return override ? override.map((w) => [...w]) : [];
  }
  if (isClosedDate(dateISO, config)) return [];
  const windows = config.weekly[isoWeekday(dateISO)];
  return windows ? windows.map((w) => [...w]) : [];
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(total) {
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Orari di inizio slot per una data (senza filtrare passato/prenotati). */
export function getSlotsForDate(dateISO, config = scheduleConfig) {
  const slots = [];
  for (const [start, end] of getWindowsForDate(dateISO, config)) {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    for (let t = startMin; t + config.slotMinutes <= endMin; t += config.slotMinutes) {
      slots.push(fromMinutes(t));
    }
  }
  return slots;
}

/** True se lo slot è formalmente valido nella matrice orari. */
export function isValidSlot(dateISO, time, config = scheduleConfig) {
  return getSlotsForDate(dateISO, config).includes(time);
}

/**
 * Uno slot è passato se inizia prima di (ora attuale + minNoticeHours).
 * Usa minuti assoluti dall'epoch per gestire correttamente il confine di
 * mezzanotte e il preavviso che scavalca il giorno.
 */
export function isSlotPast(dateISO, time, config = scheduleConfig, reference = new Date()) {
  const now = nowInTimeZone(config.timezone, reference);
  const nowAbsolute = daysSinceEpoch(now.date) * 1440 + toMinutes(now.time);
  const slotAbsolute = daysSinceEpoch(dateISO) * 1440 + toMinutes(time);
  return slotAbsolute < nowAbsolute + config.minNoticeHours * 60;
}

function daysSinceEpoch(dateISO) {
  return Math.floor(parseISODate(dateISO).getTime() / 86400000);
}

/** True se la data è oltre l'orizzonte di prenotazione consentito. */
export function isBeyondHorizon(dateISO, config = scheduleConfig, reference = new Date()) {
  const now = nowInTimeZone(config.timezone, reference);
  const limit = addDays(mondayOf(now.date), (config.bookingWeeksAhead - 1) * 7 + 6);
  return dateISO > limit;
}

/* ------------------------------------------------------------------ */
/* Etichette                                                           */
/* ------------------------------------------------------------------ */

export function weekdayName(dateISO, short = false) {
  const wd = isoWeekday(dateISO);
  return short ? WD_SHORT[wd === 7 ? 0 : wd] : WD_NAMES[wd === 7 ? 0 : wd];
}

export function formatDayLabel(dateISO) {
  const date = parseISODate(dateISO);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function formatWeekLabel(mondayISO) {
  const start = parseISODate(mondayISO);
  const end = parseISODate(addDays(mondayISO, 6));
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startLabel = `${start.getUTCDate()}${sameMonth ? '' : ` ${MONTHS[start.getUTCMonth()]}`}`;
  const endLabel = `${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

export function formatLongDate(dateISO) {
  const date = parseISODate(dateISO);
  return `${WD_NAMES[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Elenco date (YYYY-MM-DD) da lunedì a domenica. */
export function weekDates(mondayISO) {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayISO, i));
}

/** True se lo slot può ancora essere prenotato (matrice + futuro + orizzonte). */
export function isSlotBookable(dateISO, time, config = scheduleConfig, reference = new Date()) {
  if (!isValidSlot(dateISO, time, config)) return false;
  if (isSlotPast(dateISO, time, config, reference)) return false;
  if (isBeyondHorizon(dateISO, config, reference)) return false;
  return true;
}
