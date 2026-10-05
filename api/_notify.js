/**
 * Canali di notifica per un appuntamento: webhook HTTP + email Resend.
 * Usato da api/book.js (invio automatico) e api/bookings.js (reinvio manuale).
 */
import { notificationsConfig as cfg } from '../config/notifications.js';
import { formatLongDate } from '../config/schedule.js';

function env() {
  return typeof process !== 'undefined' ? process.env ?? {} : {};
}

/**
 * Primo valore "non vuoto" tra quelli passati.
 * Uno spazio (o una stringa di soli spazi) conta come assente: così le env
 * bianche non bloccano la catena di fallback (`' ' || fallback` sarebbe truthy).
 */
function firstValue(...values) {
  for (const value of values) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) return trimmed;
  }
  return '';
}

/** Destinatari validi dalla prima sorgente che ne contiene almeno uno. */
function recipientList(...values) {
  for (const value of values) {
    const list = String(value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [];
}

function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname.length > 1 ? '/…' : ''}`;
  } catch {
    return 'configurato';
  }
}

export function webhookSettings() {
  const e = env();
  return {
    url: firstValue(e.BOOKING_WEBHOOK_URL, e.APPOINTMENT_WEBHOOK_URL, cfg.webhookUrl),
    secret: firstValue(e.BOOKING_WEBHOOK_SECRET, cfg.webhookSecret),
    timeoutMs: cfg.webhookTimeoutMs,
  };
}

export function emailSettings() {
  const e = env();
  return {
    apiKey: firstValue(e.RESEND_API_KEY),
    to: recipientList(e.BOOKING_NOTIFY_EMAIL, cfg.emailTo),
    from: firstValue(e.BOOKING_FROM_EMAIL, cfg.emailFrom),
  };
}

/** Impostazioni email per il form di contatto (contatti del sito). */
export function contactEmailSettings() {
  const e = env();
  return {
    apiKey: firstValue(e.RESEND_API_KEY),
    to: recipientList(
      e.CONTACT_NOTIFY_EMAIL,
      e.BOOKING_NOTIFY_EMAIL,
      cfg.contactEmailTo,
      cfg.emailTo,
    ),
    from: firstValue(e.CONTACT_FROM_EMAIL, e.BOOKING_FROM_EMAIL, cfg.emailFrom),
  };
}

/**
 * Invio generico via Resend. Ritorna { ok } oppure { ok:false, skipped:true }
 * quando le credenziali non sono configurate.
 */
export async function sendEmail({ apiKey, from, to, subject, text, html, replyTo }) {
  const recipients = Array.isArray(to) ? to : [to].filter(Boolean);
  if (!apiKey || recipients.length === 0) {
    return { ok: false, skipped: true, reason: 'email-not-configured' };
  }
  const body = { from, to: recipients, subject, text };
  if (html) body.html = html;
  if (replyTo) body.reply_to = replyTo;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, error: 'network-error' };
  }
}

/** Stato dei canali (per la UI del pannello, senza esporre segreti). */
export function notificationChannels() {
  const webhook = webhookSettings();
  const email = emailSettings();
  return {
    webhook: { configured: Boolean(webhook.url), target: webhook.url ? maskUrl(webhook.url) : null },
    email: { configured: Boolean(email.apiKey && email.to.length), recipients: email.to },
  };
}

function eventPayload(type, booking) {
  return {
    event: type,
    sentAt: new Date().toISOString(),
    source: 'il-ponte-pedagogico',
    appointment: {
      code: booking.code,
      slotId: booking.slotId,
      date: booking.date,
      time: booking.time,
      durationMinutes: booking.durationMinutes ?? 15,
      timezone: booking.timezone ?? 'Europe/Rome',
      name: booking.name,
      email: booking.email,
      phone: booking.phone ?? null,
      topic: booking.topic ?? null,
      notes: booking.notes ?? null,
      status: booking.status ?? 'confirmed',
      createdAt: booking.createdAt ?? null,
    },
  };
}

export async function sendAppointmentEvent(type, booking) {
  const { url, secret, timeoutMs } = webhookSettings();
  if (!url) return { ok: false, skipped: true, reason: 'webhook-not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ponte-event': type,
        'user-agent': 'IlPontePedagogico-Webhook/1.0',
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(eventPayload(type, booking)),
      signal: controller.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? 'timeout' : 'network-error' };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendAppointmentEmail(type, booking) {
  const { apiKey, to, from } = emailSettings();
  if (!apiKey || to.length === 0) {
    return { ok: false, skipped: true, reason: 'email-not-configured' };
  }
  const when = `${formatLongDate(booking.date)} alle ${booking.time}`;
  const prefix = type === 'appointment.resent' ? '[Reinvio] ' : '';
  const subject = `${prefix}Appuntamento 15 min — ${when}`;

  const rows = [
    ['Data', when],
    ['Durata', `${booking.durationMinutes ?? 15} minuti`],
    ['Codice', booking.code],
    ['Nome', booking.name],
    ['Email', booking.email],
    ['Telefono', booking.phone || '—'],
    ['Motivo', booking.topic || '—'],
    ['Note', booking.notes || '—'],
    ['Fuso', booking.timezone ?? 'Europe/Rome'],
  ];

  const text = [
    `${subject}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Il Ponte Pedagogico — Dott.ssa Noemi Urboni',
    'www.pontepedagogico.it',
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#4f463f;line-height:1.6">
      <h2 style="font-family:Georgia,serif;margin:0 0 4px">${subject}</h2>
      <p style="color:#786b61;margin:0 0 16px">Incontro conoscitivo gratuito di 15 minuti.</p>
      <table style="border-collapse:collapse;width:100%;max-width:520px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 0;color:#786b61;font-weight:700">${label}</td><td style="padding:6px 0">${value}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="margin-top:16px;color:#786b61">Il Ponte Pedagogico — Dott.ssa Noemi Urboni<br/>www.pontepedagogico.it</p>
    </div>`;

  return sendEmail({ apiKey, from, to, subject, text, html });
}

/** Invio su tutti i canali configurati. */
export async function notifyAppointment(type, booking) {
  const [webhook, email] = await Promise.all([
    sendAppointmentEvent(type, booking).catch(() => ({ ok: false, error: 'exception' })),
    sendAppointmentEmail(type, booking).catch(() => ({ ok: false, error: 'exception' })),
  ]);
  return { webhook, email };
}
