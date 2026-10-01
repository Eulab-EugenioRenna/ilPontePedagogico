/**
 * Vercel Edge Function — /api/bookings
 *
 *   GET  /api/bookings                storico completo degli appuntamenti
 *   POST /api/bookings                reinvia l'evento di un appuntamento
 *                                     body: { slotId | date+time, channel? }
 *                                     channel: "webhook" | "email" | "all"
 *
 * Protezione: se `ADMIN_USERNAME`/`ADMIN_PASSWORD` (o `ADMIN_ACCESS_TOKEN`) sono
 * impostati, richiede autenticazione. Accetta il token di sessione firmato
 * (header `x-admin-token` o `Authorization: Bearer`), il vecchio token statico
 * oppure Basic Auth (`Authorization: Basic ...`).
 */
import { nowInTimeZone, scheduleConfig } from '../config/schedule.js';
import { authRequired, isAuthorized } from './_auth.js';
import {
  notificationChannels,
  sendAppointmentEmail,
  sendAppointmentEvent,
} from './_notify.js';
import { getBooking, listBookings, storeKind } from './_store.js';

export const config = { runtime: 'edge' };

const SLOT_RE = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, x-admin-token',
    },
  });
}

function fail(code, message, status = 400) {
  return json({ ok: false, error: { code, message } }, status);
}

/** Arricchisce il record con lo stato temporale rispetto ad "adesso". */
function decorate(booking, now) {
  const isPast =
    booking.date < now.date || (booking.date === now.date && booking.time < now.time);
  return { ...booking, past: isPast };
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'access-control-allow-origin': '*' },
    });
  }

  if (!(await isAuthorized(request))) {
    return fail('unauthorized', 'Accesso non autorizzato.', 401);
  }

  const now = nowInTimeZone(scheduleConfig.timezone);

  if (request.method === 'GET') {
    let appointments = [];
    let warning = null;
    try {
      appointments = await listBookings();
    } catch {
      warning = 'store-unavailable';
    }
    appointments = appointments
      .map((item) => decorate(item, now))
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

    return json({
      ok: true,
      store: storeKind(),
      timezone: scheduleConfig.timezone,
      serverNow: now,
      requiresToken: authRequired(),
      channels: notificationChannels(),
      count: appointments.length,
      warning,
      appointments,
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

  let date = String(body.date ?? '');
  let time = String(body.time ?? '');
  if (body.slotId) {
    const match = SLOT_RE.test(body.slotId);
    if (!match) return fail('invalid-slot', 'slotId non valido.');
    [date, time] = body.slotId.split('T');
  }
  if (!date || !time) return fail('invalid-slot', 'Indica slotId oppure date e time.');

  let booking;
  try {
    booking = await getBooking(date, time);
  } catch {
    return fail('store-error', 'Store non disponibile.', 503);
  }
  if (!booking) return fail('not-found', 'Appuntamento non trovato.', 404);

  const channel = ['webhook', 'email', 'all'].includes(body.channel) ? body.channel : 'all';
  const type = 'appointment.resent';
  const results = {};

  if (channel === 'webhook' || channel === 'all') {
    results.webhook = await sendAppointmentEvent(type, booking);
  }
  if (channel === 'email' || channel === 'all') {
    results.email = await sendAppointmentEmail(type, booking);
  }

  const anyOk = Object.values(results).some((result) => result?.ok);
  const allSkipped = Object.values(results).every((result) => result?.skipped);
  return json(
    {
      ok: anyOk,
      skipped: allSkipped,
      sentAt: new Date().toISOString(),
      channel,
      results,
      appointment: decorate(booking, now),
    },
    anyOk || allSkipped ? 200 : 502,
  );
}
