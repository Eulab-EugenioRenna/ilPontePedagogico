/**
 * Vercel Edge Function — POST /api/admin-login
 *
 * Body JSON: { username, password }
 * Verifica le credenziali (env ADMIN_USERNAME / ADMIN_PASSWORD) e restituisce
 * un token di sessione firmato, da usare come `x-admin-token` (o Bearer).
 */
import { authRequired, getAuthConfig, issueSessionToken, verifyCredentials } from './_auth.js';

export const config = { runtime: 'edge' };

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

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*' } });
  }
  if (request.method !== 'POST') {
    return fail('method-not-allowed', 'Metodo non consentito.', 405);
  }

  const { credentialsEnabled } = getAuthConfig();
  if (!credentialsEnabled) {
    return fail(
      'auth-not-configured',
      'Accesso con nome utente e password non configurato (ADMIN_USERNAME / ADMIN_PASSWORD).',
      503,
    );
  }
  if (!authRequired()) {
    return fail('auth-disabled', 'Il pannello non è protetto.', 400);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('invalid-json', 'Richiesta non valida.');
  }

  if (!verifyCredentials(body.username, body.password)) {
    // Piccolo ritardo per rendere meno praticabili i tentativi a raffica.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fail('invalid-credentials', 'Nome utente o password non corretti.', 401);
  }

  const { token, expiresAt } = await issueSessionToken();
  return json({ ok: true, token, expiresAt });
}
