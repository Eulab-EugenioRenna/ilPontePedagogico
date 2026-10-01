/**
 * Persistenza prenotazioni per le Edge Functions.
 *
 * Usa un database Redis compatibile con l'API REST di Upstash (Vercel KV /
 * Upstash / Redis compatibili). Se le variabili d'ambiente non sono
 * configurate, ricade su uno store in-memory: utile in sviluppo, ma NON
 * affidabile in produzione (le isolate Edge non condividono memoria).
 *
 * Variabili riconosciute (coppie URL+TOKEN, le prime complete trovate):
 *   - KV_REST_API_URL / KV_REST_API_TOKEN                              (Vercel KV)
 *   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN                (Upstash)
 *   - UPSTASH_REDIS_REST_KV_REST_API_URL / ..._KV_REST_API_TOKEN       (Upstash via integrazione Vercel, nomi prefissati)
 *   - REDIS_REST_URL / REDIS_REST_TOKEN                                (generici)
 *
 * NB: le variabili "REDIS_URL"/"KV_URL" (rediss://...) NON sono REST e non
 * sono usate qui.
 */

const PREFIX = 'pp';

// Ogni gruppo è [chiaveURL, chiaveToken]: si usa la prima coppia completa,
// così URL e token provengono sempre dalla stessa configurazione.
const CONFIG_GROUPS = [
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['UPSTASH_REDIS_REST_KV_REST_API_URL', 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN'],
  ['REDIS_REST_URL', 'REDIS_REST_TOKEN'],
];

function resolveConfig() {
  const env = typeof process !== 'undefined' ? process.env ?? {} : {};
  for (const [urlKey, tokenKey] of CONFIG_GROUPS) {
    const url = String(env[urlKey] ?? '').trim();
    const token = String(env[tokenKey] ?? '').trim();
    if (url && token) return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

const memory = {
  bookings: new Map(),
  days: new Map(),
};

/**
 * True se possiamo usare lo store in-memory di ripiego.
 *
 * Redis è lo store di DEFAULT: in produzione/preview (runtime Vercel) è
 * obbligatorio, perché la memoria per-isolate non è affidabile. La memoria
 * resta disponibile solo in locale, oppure forzandola con `BOOKING_STORE=memory`.
 * Con `BOOKING_STORE=redis` Redis è richiesto esplicitamente.
 */
function useMemoryFallback() {
  if (resolveConfig()) return false;
  const forced = String(process.env.BOOKING_STORE ?? '').toLowerCase();
  if (forced === 'memory') return true;
  if (forced === 'redis') return false;
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv !== 'production' && vercelEnv !== 'preview';
}

/** True in produzione/preview: qui Redis è obbligatorio. */
function requiresRedis() {
  return !resolveConfig() && !useMemoryFallback();
}

export function storeKind() {
  if (resolveConfig()) return 'redis';
  return useMemoryFallback() ? 'memory' : 'unconfigured';
}

// I nomi degli export pubblici restano gli stessi; i chiamanti (availability,
// book, bookings) gestiscono l'errore `store-not-configured`.

async function redisCommand(body) {
  const conf = resolveConfig();
  if (!conf) throw new Error('no-redis');
  const res = await fetch(conf.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${conf.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`redis-http-${res.status}`);
  }
  const json = await res.json();
  // Le pipeline (body = array di comandi) rispondono con un array di { result }.
  // I comandi singoli rispondono con un oggetto { result }.
  if (Array.isArray(json)) return json;
  if (json.error) throw new Error(json.error);
  return json.result;
}

const dayKey = (dateISO) => `${PREFIX}:day:${dateISO}`;
const slotKey = (dateISO, time) => `${PREFIX}:booking:${dateISO}T${time}`;
const INDEX_KEY = `${PREFIX}:bookings:index`;

/** Punteggio ordinabile per uno slot: YYYYMMDDHHmm come numero. */
function slotScore(dateISO, time) {
  return Number(`${dateISO.replace(/-/g, '')}${time.replace(':', '')}`);
}

/** Restituisce { date: Set<"HH:mm"> } per un elenco di date. */
export async function getBookedTimesForDates(dates) {
  const conf = resolveConfig();
  if (!conf) {
    if (requiresRedis()) throw new Error('store-not-configured');
    return new Map(dates.map((d) => [d, new Set(memory.days.get(d) ?? [])]));
  }
  if (dates.length === 0) return new Map();
  const pipeline = dates.map((d) => ['SMEMBERS', dayKey(d)]);
  const results = await redisCommand(pipeline);
  const map = new Map();
  dates.forEach((date, index) => {
    const result = Array.isArray(results) ? results[index]?.result ?? results[index] : [];
    map.set(date, new Set(Array.isArray(result) ? result : []));
  });
  return map;
}

/**
 * Prenota in modo atomico uno slot.
 * Ritorna { ok: true, booking } oppure { ok: false, code: 'slot-taken' }.
 */
export async function reserveSlot(dateISO, time, booking) {
  const conf = resolveConfig();
  const slotId = `${dateISO}T${time}`;
  const record = { ...booking, slotId, date: dateISO, time };

  if (!conf) {
    if (requiresRedis()) throw new Error('store-not-configured');
    const times = memory.days.get(dateISO) ?? new Set();
    if (times.has(time)) return { ok: false, code: 'slot-taken' };
    times.add(time);
    memory.days.set(dateISO, times);
    memory.bookings.set(slotKey(dateISO, time), record);
    return { ok: true, booking: record };
  }

  const setResult = await redisCommand([
    'SET',
    slotKey(dateISO, time),
    JSON.stringify(record),
    'NX',
    'EX',
    60 * 60 * 24 * 365,
  ]);

  if (setResult === null) {
    return { ok: false, code: 'slot-taken' };
  }
  await redisCommand(['SADD', dayKey(dateISO), time]);
  await redisCommand(['ZADD', INDEX_KEY, slotScore(dateISO, time), slotId]);
  return { ok: true, booking: record };
}

/**
 * Elenco completo degli appuntamenti, ordinato per data/ora crescente.
 * Usa un sorted set come indice, poi recupera i record in pipeline.
 */
export async function listBookings() {
  const conf = resolveConfig();
  if (!conf) {
    if (requiresRedis()) throw new Error('store-not-configured');
    return [...memory.bookings.values()].sort(
      (a, b) => slotScore(a.date, a.time) - slotScore(b.date, b.time),
    );
  }

  const ids = await redisCommand(['ZRANGE', INDEX_KEY, 0, -1]);
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const results = await redisCommand(ids.map((id) => ['GET', `${PREFIX}:booking:${id}`]));
  const list = [];
  results.forEach((entry, index) => {
    const raw = Array.isArray(results) ? entry?.result ?? entry : null;
    if (!raw) return;
    try {
      list.push(JSON.parse(raw));
    } catch {
      /* record corrotto: ignora */
    }
  });
  // Fallback di ordinamento per robustezza.
  list.sort((a, b) => slotScore(a.date, a.time) - slotScore(b.date, b.time));
  return list;
}

export async function getBooking(dateISO, time) {
  const conf = resolveConfig();
  if (!conf) {
    if (requiresRedis()) throw new Error('store-not-configured');
    return memory.bookings.get(slotKey(dateISO, time)) ?? null;
  }
  const raw = await redisCommand(['GET', slotKey(dateISO, time)]);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
