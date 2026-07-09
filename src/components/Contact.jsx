import { contact, services } from '../data/siteContent.js';
import { InstagramIcon, WhatsAppIcon } from './SocialIcons.jsx';

function buildWhatsAppUrl(serviceTitle) {
  const message = `Ciao Noemi, vorrei ricevere informazioni su: ${serviceTitle}.`;
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function Contact({ selectedService, onSelectService }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const service = services.find((item) => item.id === data.get('service')) ?? selectedService;
    const feedback = form.querySelector('[data-form-feedback]');

    const subject = `Richiesta consulenza pedagogica - ${service.title}`;
    const body = [
      `Nome e cognome: ${data.get('name')}`,
      `Telefono: ${data.get('phone') || 'Non indicato'}`,
      `Email: ${data.get('email')}`,
      `Area di interesse: ${service.title}`,
      '',
      'Messaggio:',
      data.get('message'),
    ].join('\n');

    if (feedback) {
      feedback.textContent = 'Sto aprendo il tuo client email con il messaggio già compilato.';
      feedback.classList.add('is-visible');
    }

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contatti" className="contact section-shell">
      <div className="contact-cta" data-reveal>
        <span className="section-kicker">Contatti</span>
        <h2>Hai bisogno di orientamento educativo?</h2>
        <p>
          Ogni percorso nasce da un primo confronto. Racconta la tua situazione: valuterete insieme il tipo di supporto più adatto.
        </p>
        <div className="contact-highlight">
          <small>Servizio selezionato</small>
          <strong>{selectedService.title}</strong>
          <span>{selectedService.promise}</span>
        </div>
        <a className="button primary" href={buildWhatsAppUrl(selectedService.title)} target="_blank" rel="noreferrer">
          <WhatsAppIcon />
          Scrivimi su WhatsApp
        </a>
        <a className="instagram-link" href={contact.instagramUrl} target="_blank" rel="noreferrer">
          <InstagramIcon />
          Seguimi su Instagram
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
          <select
            name="service"
            value={selectedService.id}
            onChange={(event) => onSelectService(event.target.value)}
          >
            {services.map((service) => (
              <option value={service.id} key={service.id}>{service.title}</option>
            ))}
          </select>
        </label>
        <label>
          Messaggio
          <textarea name="message" rows="5" placeholder="Racconta brevemente la situazione o il bisogno principale" required />
        </label>
        <label className="privacy-check">
          <input type="checkbox" required />
          <span>Accetto il trattamento dei dati secondo la Privacy Policy.</span>
        </label>
        <button className="button primary full" type="submit">Invia richiesta via email</button>
        <p className="form-feedback" data-form-feedback role="status" />
      </form>
    </section>
  );
}
