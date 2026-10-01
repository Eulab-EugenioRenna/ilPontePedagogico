import { useEffect, useState } from 'react';
import { contact, services } from '../data/siteContent.js';
import { freeIntro } from '../../config/services.js';
import { InstagramIcon, WhatsAppIcon } from './SocialIcons.jsx';

const freeIntroTopic = {
  id: freeIntro.id,
  title: `${freeIntro.title} (gratuito)`,
  promise: 'Incontro conoscitivo di 15 minuti, senza impegno, per capire se e come posso esserti utile.',
};

function buildWhatsAppUrl(serviceTitle) {
  const message = `Ciao Noemi, vorrei ricevere informazioni su: ${serviceTitle}.`;
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildMailtoUrl(payload, serviceTitle) {
  const subject = `Richiesta consulenza pedagogica - ${serviceTitle}`;
  const body = [
    `Nome e cognome: ${payload.name}`,
    `Telefono: ${payload.phone || 'Non indicato'}`,
    `Email: ${payload.email}`,
    `Area di interesse: ${serviceTitle}`,
    '',
    'Messaggio:',
    payload.message,
  ].join('\n');
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact({ selectedService, onSelectService }) {
  const [topicId, setTopicId] = useState(selectedService.id);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error | fallback
  const [message, setMessage] = useState('');

  // Il servizio scelto altrove (explorer, navigator) aggiorna il selettore.
  useEffect(() => {
    setTopicId(selectedService.id);
  }, [selectedService.id]);

  const current =
    topicId === freeIntro.id
      ? freeIntroTopic
      : services.find((service) => service.id === topicId) ?? selectedService;

  const handleTopicChange = (event) => {
    const value = event.target.value;
    setTopicId(value);
    if (value !== freeIntro.id) onSelectService(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      service: current.title,
      serviceId: current.id,
      message: String(data.get('message') ?? '').trim(),
      consent: data.get('consent') === 'on',
    };

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !type.includes('application/json')) {
        throw Object.assign(new Error('api-unavailable'), { fallback: true });
      }
      const result = await res.json();
      if (!result.ok) {
        if (result.error?.code === 'email-not-configured') {
          throw Object.assign(new Error(result.error.message), { fallback: true });
        }
        throw new Error(result.error?.message ?? 'Invio non riuscito.');
      }
      form.reset();
      setStatus('success');
      setMessage('Messaggio inviato! Ti risponderò il prima possibile.');
    } catch (error) {
      if (error.fallback) {
        window.location.href = buildMailtoUrl(payload, current.title);
        setStatus('fallback');
        setMessage('Sto aprendo il tuo client email con il messaggio già compilato.');
      } else {
        setStatus('error');
        setMessage(error.message || 'Qualcosa è andato storto. Riprova o scrivimi su WhatsApp.');
      }
    }
  };

  return (
    <div className="contact">
      <div className="contact-cta" data-reveal>
        <span className="section-kicker">Il primo passo</span>
        <h2>Non devi avere già le parole giuste.</h2>
        <p>
          Raccontami cosa sta succedendo e qual è il momento che oggi ti preoccupa di più. Valuteremo insieme se e in che modo posso esserti utile.
        </p>
        <div className="contact-highlight">
          <small>Servizio selezionato</small>
          <strong>{current.title}</strong>
          <span>{current.promise}</span>
        </div>
        <a className="button primary" href={buildWhatsAppUrl(current.title)} target="_blank" rel="noreferrer">
          <WhatsAppIcon />
          Raccontami cosa sta succedendo
        </a>
        <a className="button secondary" href={contact.instagramUrl} target="_blank" rel="noreferrer">
          <InstagramIcon />
          Conosci il mio lavoro su Instagram
        </a>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} data-reveal>
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
          Area di interesse
          <select name="service" value={topicId} onChange={handleTopicChange}>
            {services.map((service) => (
              <option value={service.id} key={service.id}>{service.title}</option>
            ))}
            <option value={freeIntro.id}>{freeIntroTopic.title}</option>
          </select>
        </label>
        <label>
          Messaggio
          <textarea name="message" rows="5" placeholder="Qual è il momento che oggi ti mette più in difficoltà?" required />
        </label>
        <label className="privacy-check">
          <input type="checkbox" required />
          <span>Accetto il trattamento dei dati secondo la Privacy Policy.</span>
        </label>
        <button className="button primary full" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Invio in corso…' : 'Chiedi un primo orientamento'}
        </button>
        {message && (
          <p
            className={
              status === 'error'
                ? 'form-feedback is-visible is-error'
                : 'form-feedback is-visible'
            }
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
