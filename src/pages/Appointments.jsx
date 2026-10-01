import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatLongDate, scheduleConfig } from '../../config/schedule.js';
import { navigate } from '../router.jsx';

const SESSION_KEY = 'pp_admin_session';

function getSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) ?? '';
  } catch {
    return '';
  }
}

function setSession(value) {
  try {
    if (value) window.sessionStorage.setItem(SESSION_KEY, value);
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage non disponibile */
  }
}

/** Legge il nome utente dal payload del token di sessione (senza fidarsene). */
function readUsername(token) {
  try {
    const [payload] = String(token).split('.');
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
    const bin = atob(b64 + pad);
    const bytes = Uint8Array.from(bin, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes))?.u || '';
  } catch {
    return '';
  }
}

function formatTimestamp(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: scheduleConfig.timezone,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function describeResult(json) {
  if (!json) return 'Nessuna risposta dal server.';
  if (json.error) return json.error.message ?? 'Errore.';
  const parts = [];
  const webhook = json.results?.webhook;
  if (webhook) {
    parts.push(
      webhook.ok
        ? 'Webhook inviato ✓'
        : webhook.skipped
          ? 'Webhook non configurato'
          : `Webhook errore${webhook.status ? ` (${webhook.status})` : ''}`,
    );
  }
  const email = json.results?.email;
  if (email) {
    parts.push(
      email.ok
        ? 'Email inviata ✓'
        : email.skipped
          ? 'Email non configurata'
          : `Email errore${email.status ? ` (${email.status})` : ''}`,
    );
  }
  return parts.join(' · ') || 'Esito sconosciuto';
}

export default function Appointments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSessionState] = useState(() => getSession());
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [busy, setBusy] = useState({});
  const [feedback, setFeedback] = useState({});

  const load = useCallback(
    async (tokenOverride) => {
      const token = tokenOverride ?? getSession();
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/bookings', {
          headers: token ? { 'x-admin-token': token } : {},
          cache: 'no-store',
        });
        if (res.status === 401) {
          setSession('');
          setSessionState('');
          setNeedsAuth(true);
          setData(null);
          setLoading(false);
          return;
        }
        const type = res.headers.get('content-type') ?? '';
        if (!res.ok || !type.includes('application/json')) throw new Error('api-unavailable');
        const json = await res.json();
        if (!json.ok) throw new Error(json.error?.message ?? 'api-error');
        setData(json);
        setSessionState(token);
        setNeedsAuth(false);
      } catch {
        setError(
          'Impossibile contattare il backend. In locale avvia `npx vercel dev` per usare le Edge Functions.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const appointments = data?.appointments ?? [];
  const upcoming = useMemo(() => appointments.filter((item) => !item.past), [appointments]);
  const past = useMemo(() => appointments.filter((item) => item.past), [appointments]);
  const username = useMemo(() => readUsername(session), [session]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setLoginError(json?.error?.message ?? 'Accesso non riuscito.');
        return;
      }
      setSession(json.token);
      setSessionState(json.token);
      setLoginPass('');
      setNeedsAuth(false);
      load(json.token);
    } catch {
      setLoginError('Impossibile contattare il backend.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = () => {
    setSession('');
    setSessionState('');
    setData(null);
    setNeedsAuth(true);
    setLoginUser('');
    setLoginPass('');
    setLoginError('');
  };

  const resend = async (item, channel) => {
    const slotId = item.slotId ?? `${item.date}T${item.time}`;
    setBusy((prev) => ({ ...prev, [slotId]: channel }));
    try {
      const token = getSession();
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { 'x-admin-token': token } : {}) },
        body: JSON.stringify({ slotId, channel }),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const json = await res.json();
      setFeedback((prev) => ({ ...prev, [slotId]: { channel, ok: Boolean(json?.ok), text: describeResult(json) } }));
    } catch {
      setFeedback((prev) => ({ ...prev, [slotId]: { channel, ok: false, text: 'Errore di rete.' } }));
    } finally {
      setBusy((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }
  };

  const renderCard = (item) => {
    const slotId = item.slotId ?? `${item.date}T${item.time}`;
    const current = busy[slotId];
    const note = feedback[slotId];
    return (
      <article className={item.past ? 'appt-card is-past' : 'appt-card'} key={slotId}>
        <div className="appt-when">
          <strong>{item.time}</strong>
          <span>{formatLongDate(item.date)}</span>
          <small>{item.past ? 'Passato' : 'In arrivo'} · {item.durationMinutes ?? 15} min</small>
        </div>
        <div className="appt-body">
          <div className="appt-person">
            <strong>{item.name}</strong>
            <div className="appt-contacts">
              <a href={`mailto:${item.email}`}>{item.email}</a>
              {item.phone && <a href={`tel:${item.phone.replace(/\s+/g, '')}`}>{item.phone}</a>}
            </div>
          </div>
          <div className="appt-meta">
            <span>Motivo: {item.topic || '—'}</span>
            {item.notes && <span>Note: {item.notes}</span>}
            <span>Codice: {item.code}</span>
            <span>Richiesto il: {formatTimestamp(item.createdAt)}</span>
          </div>
        </div>
        <div className="appt-actions">
          <button
            type="button"
            className="button ghost"
            onClick={() => resend(item, 'webhook')}
            disabled={Boolean(current)}
          >
            {current === 'webhook' ? 'Invio…' : 'Invia webhook'}
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => resend(item, 'email')}
            disabled={Boolean(current)}
          >
            {current === 'email' ? 'Invio…' : 'Invia email'}
          </button>
          {note && (
            <span className={note.ok ? 'appt-feedback ok' : 'appt-feedback ko'} role="status">
              {note.text}
            </span>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="admin">
      <header className="admin-bar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/'); }}>
          <span className="brand-mark" aria-hidden="true">∩</span>
          <span>
            <strong>Il Ponte</strong>
            <small>Pedagogico</small>
          </span>
        </a>
        <div className="admin-bar-actions">
          {session && (
            <span className="admin-user">{username ? `Ciao, ${username}` : 'Accesso attivo'}</span>
          )}
          {session && (
            <button type="button" className="button ghost" onClick={handleLogout}>Esci</button>
          )}
          <button type="button" className="button ghost" onClick={() => load()} disabled={loading || needsAuth}>
            {loading ? 'Carico…' : 'Aggiorna'}
          </button>
          <a className="button primary" href="/">← Torna al sito</a>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-intro">
          <span className="section-kicker">Pannello interno</span>
          <h1>Appuntamenti</h1>
          <p>
            Storico delle richieste di incontro conoscitivo gratuito. Per ogni appuntamento
            puoi reinviare l’evento al webhook oppure la notifica email.
          </p>
        </div>

        {needsAuth ? (
          <form className="admin-token" onSubmit={handleLogin}>
            <h3>Area protetta</h3>
            <p>Inserisci nome utente e password per accedere.</p>
            <label>
              Nome utente
              <input
                type="text"
                value={loginUser}
                onChange={(event) => setLoginUser(event.target.value)}
                placeholder="Nome utente"
                autoComplete="username"
                autoFocus
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPass}
                onChange={(event) => setLoginPass(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button primary" type="submit" disabled={loginBusy}>
              {loginBusy ? 'Accesso…' : 'Entra'}
            </button>
            {loginError && <p className="admin-error" role="alert">{loginError}</p>}
          </form>
        ) : (
          <>
            {data && (
              <div className="admin-channels">
                <div className={data.channels?.webhook?.configured ? 'channel is-on' : 'channel'}>
                  <span>Webhook</span>
                  <strong>{data.channels?.webhook?.configured ? data.channels.webhook.target : 'Non configurato'}</strong>
                </div>
                <div className={data.channels?.email?.configured ? 'channel is-on' : 'channel'}>
                  <span>Email (Resend)</span>
                  <strong>
                    {data.channels?.email?.configured
                      ? data.channels.email.recipients.join(', ')
                      : 'Non configurata'}
                  </strong>
                </div>
                <div className="channel">
                  <span>Store</span>
                  <strong>{data.store}</strong>
                </div>
              </div>
            )}

            {error && (
              <p className="admin-error" role="alert">{error}</p>
            )}

            {loading && !data && <p className="admin-empty">Caricamento appuntamenti…</p>}

            {data && appointments.length === 0 && (
              <p className="admin-empty">Nessun appuntamento registrato finora.</p>
            )}

            {upcoming.length > 0 && (
              <section className="admin-group">
                <h2>In arrivo <span>{upcoming.length}</span></h2>
                <div className="appt-list">{upcoming.map(renderCard)}</div>
              </section>
            )}

            {past.length > 0 && (
              <section className="admin-group">
                <h2>Passati <span>{past.length}</span></h2>
                <div className="appt-list">{past.map(renderCard)}</div>
              </section>
            )}

            {!data?.channels?.webhook?.configured && !error && (
              <p className="admin-hint">
                Per ricevere gli eventi imposta la variabile <code>BOOKING_WEBHOOK_URL</code> (o il
                campo <code>webhookUrl</code> in <code>config/notifications.js</code>).
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
