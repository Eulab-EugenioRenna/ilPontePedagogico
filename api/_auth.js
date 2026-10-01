/**
 * Autenticazione per il pannello /appuntamenti.
 *
 * Metodo principale: nome utente + password (env ADMIN_USERNAME / ADMIN_PASSWORD).
 * Dopo il login viene emesso un token di sessione firmato (HMAC-SHA256) con
 * scadenza: il browser NON conserva la password.
 *
 * Retro-compatibilità: è ancora accettato il vecchio ADMIN_ACCESS_TOKEN passato
 * come header `x-admin-token` oppure `Authorization: Bearer <token>`.
 *
 * Variabili:
 *   ADMIN_USERNAME          nome utente del pannello
 *   ADMIN_PASSWORD          password del pannello
 *   ADMIN_SESSION_SECRET    segreto firma token (opzionale; default = password)
 *   ADMIN_SESSION_HOURS     durata sessione in ore (default 12)
 *   ADMIN_ACCESS_TOKEN      token statico legacy (opzionale)
 */

const DEFAULT_SESSION_HOURS = 12;

function env() {
  return typeof process !== 'undefined' ? process.env ?? {} : {};
}

export function getAuthConfig() {
  const e = env();
  const username = String(e.ADMIN_USERNAME ?? '').trim();
  const password = String(e.ADMIN_PASSWORD ?? '');
  const accessToken = String(e.ADMIN_ACCESS_TOKEN ?? '').trim();
  const sessionHours = Number(e.ADMIN_SESSION_HOURS) > 0 ? Number(e.ADMIN_SESSION_HOURS) : DEFAULT_SESSION_HOURS;
  return {
    username,
    password,
    accessToken,
    sessionSecret: String(e.ADMIN_SESSION_SECRET ?? '') || password,
    sessionMs: sessionHours * 60 * 60 * 1000,
    credentialsEnabled: Boolean(username && password),
  };
}

/** True se il pannello è protetto (credenziali o token legacy). */
export function authRequired() {
  const { credentialsEnabled, accessToken } = getAuthConfig();
  return credentialsEnabled || Boolean(accessToken);
}

/* ---------------- base64url + HMAC ---------------- */

function bytesToBase64url(bytes) {
  let str = '';
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(input) {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : '';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function encodeString(value) {
  return bytesToBase64url(new TextEncoder().encode(value));
}

function decodeString(value) {
  return new TextDecoder().decode(base64urlToBytes(value));
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64url(new Uint8Array(signature));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------- credenziali e token ---------------- */

export function verifyCredentials(username, password) {
  const { username: expectedUser, password: expectedPass, credentialsEnabled } = getAuthConfig();
  if (!credentialsEnabled) return false;
  return safeEqual(String(username ?? ''), expectedUser) && safeEqual(String(password ?? ''), expectedPass);
}

export async function issueSessionToken() {
  const { username, sessionSecret, sessionMs } = getAuthConfig();
  const expiresAt = Date.now() + sessionMs;
  const payload = encodeString(JSON.stringify({ u: username, exp: expiresAt }));
  const signature = await hmac(payload, sessionSecret);
  return { token: `${payload}.${signature}`, expiresAt };
}

export async function verifySessionToken(token) {
  const { sessionSecret } = getAuthConfig();
  if (!sessionSecret) return false;
  const [payload, signature] = String(token ?? '').split('.');
  if (!payload || !signature) return false;
  const expected = await hmac(payload, sessionSecret);
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(decodeString(payload));
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** Legge il payload (username/scadenza) di un token di sessione, senza fidarsi. */
export function readSessionPayload(token) {
  try {
    const [payload] = String(token ?? '').split('.');
    return JSON.parse(decodeString(payload));
  } catch {
    return null;
  }
}

/**
 * Autorizza la richiesta: token di sessione firmato, token statico legacy
 * oppure Basic Auth (username:password).
 */
export async function isAuthorized(request) {
  const { accessToken } = getAuthConfig();
  const header = request.headers.get('authorization') || '';
  const xToken = request.headers.get('x-admin-token') || '';

  if (accessToken && (xToken === accessToken || header === `Bearer ${accessToken}`)) return true;

  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (bearer && (await verifySessionToken(bearer))) return true;
  if (xToken && (await verifySessionToken(xToken))) return true;

  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const index = decoded.indexOf(':');
      if (index >= 0) {
        return verifyCredentials(decoded.slice(0, index), decoded.slice(index + 1));
      }
    } catch {
      return false;
    }
  }
  return false;
}
