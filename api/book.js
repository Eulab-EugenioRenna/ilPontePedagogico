/**
 * Vercel Edge Function — POST /api/book
 *
 * Prenota un incontro conoscitivo gratuito di 15 minuti.
 * Body JSON:
 *   { date, time, name, email, phone?, topic?, notes?, consent }
 *
 * Validazione contro la matrice orari (config/schedule.js) e prenotazione
 * atomica sullo store. Per ogni nuovo appuntamento invia un evento ai canali
 * configurati (webhook + email Resend) — vedi api/_notify.js.
 */
import {
  isBeyondHorizon,
  isValidSlot,
  isSlotPast,
  nowInTimeZone,
  scheduleConfig,
} from '../config/schedule.js';
import { notificationChannels, notifyAppointment } from './_notify.js';
import { reserveSlot } from './_store.js';

export const config = { runtime: 'edge' };

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

function fail(code, message, status = 400) {
  return json({ ok: false, error: { code, message } }, status);
}

function referenceCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) code += alphabet[byte % alphabet.length];
  return `PP-${code}`;
}

function sanitize(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export default async function handler(request, context) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'access-control-allow-origin': '*' },
    });
  }
  if (request.method !== 'POST') {
    return fail('method-not-allowed', 'Metodo non consentito.', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('invalid-json', 'Richiesta non valida.');
  }

  const date = sanitize(body.date, 10);
  const time = sanitize(body.time, 5);
  const name = sanitize(body.name, 120);
  const email = sanitize(body.email, 160).toLowerCase();
  const phone = sanitize(body.phone, 40);
  const topic = sanitize(body.topic, 120);
  const notes = sanitize(body.notes, 600);
  const consent = body.consent === true;

  if (!ISO_RE.test(date) || !TIME_RE.test(time)) {
    return fail('invalid-slot', 'Data o orario non validi.');
  }
  if (name.length < 2) return fail('invalid-name', 'Inserisci il tuo nome.');
  if (!EMAIL_RE.test(email)) return fail('invalid-email', 'Inserisci un’email valida.');
  if (!consent) return fail('consent-required', 'È necessario accettare il trattamento dei dati.');

  if (!isValidSlot(date, time)) {
    return fail('unavailable-slot', 'L’orario scelto non è disponibile.', 409);
  }
  if (isSlotPast(date, time)) {
    return fail('past-slot', 'L’orario scelto è già passato.', 409);
  }
  if (isBeyondHorizon(date)) {
    return fail('beyond-horizon', 'La data scelta è troppo lontana.', 409);
  }

  const now = nowInTimeZone(scheduleConfig.timezone);
  const code = referenceCode();
  const payload = {
    name,
    email,
    phone: phone || null,
    topic: topic || null,
    notes: notes || null,
    code,
    timezone: scheduleConfig.timezone,
    durationMinutes: scheduleConfig.slotMinutes,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  let result;
  try {
    result = await reserveSlot(date, time, payload);
  } catch (error) {
    if (String(error?.message).includes('store-not-configured')) {
      return fail(
        'store-not-configured',
        'Database non configurato: imposta le variabili Redis (es. KV_REST_API_URL/TOKEN).',
        503,
      );
    }
    return fail('store-error', 'Servizio momentaneamente non disponibile. Riprova.', 503);
  }

  if (!result.ok) {
    return fail('slot-taken', 'Questo orario è appena stato prenotato. Scegline un altro.', 409);
  }

  // Notifica i canali configurati (webhook + email) senza bloccare la risposta.
  const notification = notifyAppointment('appointment.created', result.booking);
  if (context && typeof context.waitUntil === 'function') {
    context.waitUntil(notification.catch(() => {}));
  } else {
    await notification.catch(() => {});
  }

  return json({
    ok: true,
    timezone: scheduleConfig.timezone,
    serverTime: now,
    channels: notificationChannels(),
    booking: {
      code,
      date,
      time,
      durationMinutes: scheduleConfig.slotMinutes,
      meetingLabel: scheduleConfig.meetingLabel,
      name,
      topic: topic || null,
    },
  });
}
