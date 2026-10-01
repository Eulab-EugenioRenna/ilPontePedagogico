import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  formatLongDate,
  formatWeekLabel,
  getSlotsForDate,
  isSlotBookable,
  isoWeekday,
  mondayOf,
  scheduleConfig,
  todayISO,
  weekDates,
  weekdayName,
} from '../../config/schedule.js';
import { bookingTopics } from '../../config/listino.js';
import { contact } from '../data/siteContent.js';
import { WhatsAppIcon } from './SocialIcons.jsx';

const CURRENT_MONDAY = mondayOf(todayISO());
const MAX_MONDAY = addDays(CURRENT_MONDAY, (scheduleConfig.bookingWeeksAhead - 1) * 7);

/* ---------------- helpers ---------------- */

function pad(value) {
  return String(value).padStart(2, '0');
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(total) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function buildLocalWeek(weekStart) {
  return weekDates(weekStart).map((date) => {
    const slots = getSlotsForDate(date).map((time) => ({
      time,
      available: isSlotBookable(date, time),
      taken: false,
    }));
    return { date, weekday: isoWeekday(date), closed: slots.length === 0, slots };
  });
}

async function requestWeek(weekStart) {
  const res = await fetch(`/api/availability?from=${weekStart}&weeks=1`, {
    headers: { accept: 'application/json' },
  });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('application/json')) throw new Error('api-unavailable');
  const data = await res.json();
  if (!data.ok) throw new Error('api-error');
  return data;
}

function buildWhatsAppUrl(booking) {
  const message = [
    'Ciao Noemi, vorrei prenotare un incontro conoscitivo gratuito di 15 minuti.',
    `Preferenza: ${formatLongDate(booking.date)} alle ${booking.time}.`,
    booking.topic ? `Motivo: ${booking.topic}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildIcs(booking) {
  const [y, m, d] = booking.date.split('-');
  const startLocal = `${y}${m}${d}T${booking.time.replace(':', '')}00`;
  const endTime = minutesToTime(timeToMinutes(booking.time) + scheduleConfig.slotMinutes);
  const endLocal = `${y}${m}${d}T${endTime.replace(':', '')}00`;
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Il Ponte Pedagogico//Prenotazioni//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${booking.code}@pontepedagogico.it`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${scheduleConfig.timezone}:${startLocal}`,
    `DTEND;TZID=${scheduleConfig.timezone}:${endLocal}`,
    'SUMMARY:Incontro conoscitivo 15 min — Il Ponte Pedagogico',
    `DESCRIPTION:Codice ${booking.code}. ${booking.topic ? `Motivo: ${booking.topic}. ` : ''}Consulenza gratuita di 15 minuti.`,
    'LOCATION:Online / Studio',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/* ---------------- component ---------------- */

export default function Booking({ topic, onTopicChange }) {
  const [weekStart, setWeekStart] = useState(CURRENT_MONDAY);
  const [cache, setCache] = useState({});
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const formRef = useRef(null);
  const touchStart = useRef(null);

  const loadWeek = useCallback(async (start) => {
    setCache((prev) => ({ ...prev, [start]: { ...prev[start], loading: true, error: null } }));
    try {
      const data = await requestWeek(start);
      setCache((prev) => ({
        ...prev,
        [start]: { days: data.days, offline: false, loading: false, error: null },
      }));
    } catch {
      setCache((prev) => ({
        ...prev,
        [start]: {
          days: buildLocalWeek(start),
          offline: true,
          loading: false,
          error: null,
        },
      }));
    }
  }, []);

  useEffect(() => {
    if (!cache[weekStart]) loadWeek(weekStart);
  }, [weekStart, cache, loadWeek]);

  const week = cache[weekStart];
  const days = week?.days ?? [];
  const offline = week?.offline ?? false;
  const isLoading = week?.loading ?? true;

  const canPrev = weekStart > CURRENT_MONDAY;
  const canNext = weekStart < MAX_MONDAY;

  const totalAvailable = useMemo(
    () => days.reduce((sum, day) => sum + day.slots.filter((slot) => slot.available).length, 0),
    [days],
  );

  const shiftWeek = (direction) => {
    const next = addDays(weekStart, direction * 7);
    if (next < CURRENT_MONDAY || next > MAX_MONDAY) return;
    setSelected(null);
    setStatus('idle');
    setWeekStart(next);
  };

  const handleTouchStart = (event) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStart.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
    if (Math.abs(delta) > 55) shiftWeek(delta < 0 ? 1 : -1);
    touchStart.current = null;
  };

  const handleSelect = (date, time, available) => {
    if (!available) return;
    setSelected({ date, time });
    setStatus('idle');
    setMessage('');
    window.setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 40);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected) {
      setStatus('error');
      setMessage('Scegli prima un orario disponibile dal calendario.');
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      date: selected.date,
      time: selected.time,
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      topic: data.get('topic'),
      notes: data.get('notes'),
      consent: data.get('consent') === 'on',
    };

    const booking = { code: 'PP-BYHAND', ...payload, topic: payload.topic };

    if (offline) {
      // Nessun backend disponibile: si prosegue via WhatsApp.
      setConfirmed({ ...booking, offline: true });
      setStatus('success');
      window.open(buildWhatsAppUrl(booking), '_blank', 'noopener');
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        if (result?.error?.code === 'slot-taken') {
          loadWeek(weekStart);
        }
        setStatus('error');
        setMessage(result?.error?.message ?? 'Non è stato possibile completare la prenotazione.');
        return;
      }
      setConfirmed({ ...result.booking, offline: false });
      setStatus('success');
      form.reset();
      setSelected(null);
    } catch {
      setStatus('error');
      setMessage('Connessione non disponibile. Riprova o scrivimi su WhatsApp.');
    }
  };

  const resetAll = () => {
    setConfirmed(null);
    setStatus('idle');
    setMessage('');
    loadWeek(weekStart);
    window.setTimeout(() => {
      document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const downloadIcs = () => {
    if (!confirmed) return;
    const blob = new Blob([buildIcs(confirmed)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ponte-pedagogico-${confirmed.date}-${confirmed.time.replace(':', '')}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="booking-block">
      <div className="booking-shell" data-reveal>
        <div className="booking-toolbar">
          <div className="booking-nav">
            <button
              type="button"
              className="booking-arrow"
              onClick={() => shiftWeek(-1)}
              disabled={!canPrev}
              aria-label="Settimana precedente"
            >
              ‹
            </button>
            <div className="booking-week-label">
              <strong>{formatWeekLabel(weekStart)}</strong>
              <small>
                {offline ? 'Anteprima locale · orari indicativi' : `Fuso orario ${scheduleConfig.timezone}`}
              </small>
            </div>
            <button
              type="button"
              className="booking-arrow"
              onClick={() => shiftWeek(1)}
              disabled={!canNext}
              aria-label="Settimana successiva"
            >
              ›
            </button>
          </div>
          <div className="booking-meta">
            <span className="booking-count">
              {isLoading ? 'Caricamento…' : `${totalAvailable} orari liberi`}
            </span>
            <button
              type="button"
              className="booking-today"
              onClick={() => {
                setSelected(null);
                setWeekStart(CURRENT_MONDAY);
              }}
              disabled={weekStart === CURRENT_MONDAY}
            >
              Questa settimana
            </button>
          </div>
        </div>

        {offline && (
          <p className="booking-notice">
            Stai navigando in anteprima: la disponibilità mostrata non considera le
            prenotazioni già ricevute. La conferma viene completata su WhatsApp.
          </p>
        )}

        <div
          className="booking-week"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-busy={isLoading}
        >
          {days.map((day) => {
            const isToday = day.date === todayISO();
            return (
              <div className={isToday ? 'booking-day is-today' : 'booking-day'} key={day.date}>
                <header>
                  <span>{weekdayName(day.date, true)}</span>
                  <strong>{Number(day.date.slice(8, 10))}</strong>
                </header>
                <div className="booking-slots">
                  {day.closed && <span className="slot-empty">Chiuso</span>}
                  {!day.closed &&
                    day.slots.map((slot) => {
                      const isSelected =
                        selected?.date === day.date && selected?.time === slot.time;
                      const cls = [
                        'slot-chip',
                        slot.available ? 'is-available' : 'is-disabled',
                        slot.taken ? 'is-taken' : '',
                        isSelected ? 'is-selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <button
                          type="button"
                          key={`${day.date}-${slot.time}`}
                          className={cls}
                          disabled={!slot.available}
                          onClick={() => handleSelect(day.date, slot.time, slot.available)}
                          aria-label={`${weekdayName(day.date)} ${day.date} alle ${slot.time}${
                            slot.available ? '' : ' non disponibile'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
          {isLoading && !days.length && <div className="booking-skeleton" aria-hidden="true" />}
        </div>

        <div className="booking-legend">
          <span><i className="dot available" /> Disponibile</span>
          <span><i className="dot taken" /> Prenotato</span>
          <span><i className="dot disabled" /> Non prenotabile</span>
        </div>
      </div>

      {selected && status !== 'success' && (
        <form id="booking-form" className="booking-form" onSubmit={handleSubmit} data-reveal>
          <div className="booking-form-summary">
            <span className="section-kicker">Orario scelto</span>
            <strong>{formatLongDate(selected.date)}</strong>
            <span>alle {selected.time} · {scheduleConfig.slotMinutes} minuti gratuiti</span>
          </div>
          <div className="booking-form-fields">
            <div className="form-row two">
              <label>
                Nome e cognome
                <input name="name" type="text" placeholder="Il tuo nome" required />
              </label>
              <label>
                Telefono
                <input name="phone" type="tel" placeholder="+39 ..." />
              </label>
            </div>
            <label>
              Email
              <input name="email" type="email" placeholder="nome@email.it" required />
            </label>
            <label>
              Motivo dell’incontro
              <select
                name="topic"
                value={topic}
                onChange={(event) => onTopicChange?.(event.target.value)}
              >
                {bookingTopics.map((option) => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Note (facoltative)
              <textarea
                name="notes"
                rows="3"
                placeholder="Un accenno alla situazione così arrivo preparata."
              />
            </label>
            <label className="privacy-check">
              <input name="consent" type="checkbox" required />
              <span>Accetto il trattamento dei dati per la gestione della richiesta.</span>
            </label>
            <div className="booking-form-actions">
              <button
                className="button primary"
                type="submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Confermo…' : 'Conferma i 15 minuti gratuiti'}
              </button>
              <button
                className="button ghost"
                type="button"
                onClick={() => setSelected(null)}
              >
                Scegli un altro orario
              </button>
            </div>
            {status === 'error' && message && (
              <p className="booking-feedback error" role="alert">{message}</p>
            )}
          </div>
        </form>
      )}

      {status === 'success' && confirmed && (
        <div className="booking-success" role="status" data-reveal>
          <span className="booking-success-check" aria-hidden="true">✓</span>
          <h3>{confirmed.offline ? 'Richiesta pronta' : 'Prenotazione confermata!'}</h3>
          <p>
            {confirmed.offline
              ? 'Completa l’invio su WhatsApp per bloccare l’orario.'
              : 'Ti aspettiamo per l’incontro conoscitivo gratuito.'}
          </p>
          <div className="booking-success-info">
            <div>
              <small>Quando</small>
              <strong>{formatLongDate(confirmed.date)}</strong>
              <span>{confirmed.time} · {scheduleConfig.slotMinutes} minuti</span>
            </div>
            <div>
              <small>Codice</small>
              <strong>{confirmed.code}</strong>
              <span>{confirmed.topic || 'Primo contatto'}</span>
            </div>
          </div>
          <div className="booking-success-actions">
            {!confirmed.offline && (
              <button className="button primary" type="button" onClick={downloadIcs}>
                Aggiungi al calendario
              </button>
            )}
            <a
              className="button secondary"
              href={buildWhatsAppUrl(confirmed)}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon />
              {confirmed.offline ? 'Completa su WhatsApp' : 'Scrivimi su WhatsApp'}
            </a>
            <button className="button ghost" type="button" onClick={resetAll}>
              Prenota un altro orario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
