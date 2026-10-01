/**
 * Vercel Edge Function — GET /api/availability
 *
 * Restituisce la disponibilità per una o più settimane a partire da `from`.
 * Query params:
 *   from   YYYY-MM-DD  (default: lunedì della settimana corrente)
 *   weeks  intero 1..bookingWeeksAhead (default 1)
 *
 * Matte: matrice orari in config/schedule.js; prenotazioni su _store.js.
 */
import {
  addDays,
  getSlotsForDate,
  isSlotBookable,
  isoWeekday,
  mondayOf,
  nowInTimeZone,
  scheduleConfig,
  weekDates,
} from '../config/schedule.js';
import { getBookedTimesForDates, storeKind } from './_store.js';

export const config = { runtime: 'edge' };

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'access-control-allow-origin': '*' },
    });
  }
  if (request.method !== 'GET') {
    return json(
      { ok: false, error: { code: 'method-not-allowed', message: 'Metodo non consentito.' } },
      405,
    );
  }

  const url = new URL(request.url);
  const now = nowInTimeZone(scheduleConfig.timezone);

  let from = url.searchParams.get('from');
  if (from && !ISO_RE.test(from)) {
    return json(
      { ok: false, error: { code: 'invalid-from', message: 'Parametro `from` non valido.' } },
      400,
    );
  }
  from = mondayOf(from || now.date);

  const weeksRaw = Number.parseInt(url.searchParams.get('weeks') ?? '1', 10);
  const weeks = Math.min(
    Math.max(Number.isFinite(weeksRaw) ? weeksRaw : 1, 1),
    scheduleConfig.bookingWeeksAhead,
  );

  const dates = [];
  for (let w = 0; w < weeks; w += 1) {
    dates.push(...weekDates(addDays(from, w * 7)));
  }

  let bookedByDate = new Map();
  let storeWarning = null;
  try {
    bookedByDate = await getBookedTimesForDates(dates);
  } catch {
    storeWarning = 'store-unavailable';
  }

  const days = dates.map((date) => {
    const booked = bookedByDate.get(date) ?? new Set();
    const slots = getSlotsForDate(date).map((time) => ({
      time,
      available: isSlotBookable(date, time) && !booked.has(time),
      taken: booked.has(time),
    }));
    return {
      date,
      weekday: isoWeekday(date),
      closed: slots.length === 0,
      slots,
    };
  });

  return json({
    ok: true,
    timezone: scheduleConfig.timezone,
    slotMinutes: scheduleConfig.slotMinutes,
    meetingLabel: scheduleConfig.meetingLabel,
    store: storeKind(),
    warning: storeWarning,
    range: { from, to: dates[dates.length - 1] },
    generatedAt: new Date().toISOString(),
    days,
  });
}
