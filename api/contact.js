/**
 * Vercel Edge Function — POST /api/contact
 *
 * Riceve il form di contatto della landing e invia un'email via Resend
 * all'indirizzo del sito. Il visitatore è impostato come `reply_to`, così
 * rispondere all'email scrive direttamente a lui.
 *
 * Body JSON: { name, email, phone?, service?, message, consent }
 *
 * Env: RESEND_API_KEY, CONTACT_NOTIFY_EMAIL (fallback BOOKING_NOTIFY_EMAIL),
 *      CONTACT_FROM_EMAIL (fallback BOOKING_FROM_EMAIL).
 */
import { contactEmailSettings, sendEmail } from './_notify.js';

export const config = { runtime: 'edge' };

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

function sanitize(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(request) {
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

  const name = sanitize(body.name, 120);
  const email = sanitize(body.email, 160).toLowerCase();
  const phone = sanitize(body.phone, 40);
  const service = sanitize(body.service, 160);
  const message = sanitize(body.message, 2000);
  const consent = body.consent === true;

  if (name.length < 2) return fail('invalid-name', 'Inserisci il tuo nome.');
  if (!EMAIL_RE.test(email)) return fail('invalid-email', 'Inserisci un’email valida.');
  if (message.length < 5) return fail('invalid-message', 'Scrivi un breve messaggio.');
  if (!consent) return fail('consent-required', 'È necessario accettare il trattamento dei dati.');

  const { apiKey, to, from } = contactEmailSettings();
  if (!apiKey || to.length === 0) {
    return fail(
      'email-not-configured',
      'Servizio email non configurato. Puoi scrivere direttamente via email o WhatsApp.',
      503,
    );
  }

  const subject = service
    ? `Nuova richiesta dal sito — ${service}`
    : 'Nuova richiesta dal sito';

  const rows = [
    ['Nome', name],
    ['Email', email],
    ['Telefono', phone || '—'],
    ['Area di interesse', service || '—'],
  ];

  const text = [
    subject,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Messaggio:',
    message,
    '',
    '— Inviato dal form di contatto di pontepedagogico.it',
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#4f463f;line-height:1.6">
      <h2 style="font-family:Georgia,serif;margin:0 0 12px">${escapeHtml(subject)}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 0;color:#786b61;font-weight:700">${label}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="margin:16px 0 6px;color:#786b61;font-weight:700">Messaggio</p>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
      <p style="margin-top:20px;color:#786b61">— Form di contatto di pontepedagogico.it</p>
    </div>`;

  const result = await sendEmail({
    apiKey,
    from,
    to,
    subject,
    text,
    html,
    replyTo: email,
  });

  if (!result.ok && !result.skipped) {
    return fail('send-failed', 'Invio non riuscito. Riprova o scrivi via email.', 502);
  }

  return json({ ok: true, recipients: to.length });
}
