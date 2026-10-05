import { contact } from '../data/siteContent.js';
import { InstagramIcon, WhatsAppIcon } from '../components/SocialIcons.jsx';


/**
 * Pagina "in arrivo" mostrata al posto della landing quando
 * `VITE_COMING_SOON` è attiva (vedi `src/config/flags.js`).
 *
 * Lascia comunque un canale aperto (WhatsApp/email) per non perdere richieste
 * durante la manutenzione, e mantiene `noindex` finché è visibile.
 */
export default function ComingSoon() {
  const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    'Ciao Noemi, ho visto che il sito è in arrivo. Vorrei ricevere informazioni su una consulenza pedagogica.',
  )}`;

  return (
    <main className="coming-soon">
      <div className="coming-soon-card" data-reveal>
        <span className="coming-soon-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" strokeLinecap="round">
            <circle cx="32" cy="32" r="30" className="coming-soon-mark-bg" />
            <path d="M13 40c0-10.5 8.5-18 19-18s19 7.5 19 18" className="coming-soon-mark-line" />
            <path d="M9 40h46" className="coming-soon-mark-line" />
            <path d="M22 40v-4.6M32 40V27M42 40v-4.6" className="coming-soon-mark-line" />
          </svg>
        </span>

        <div className="eyebrow"><span /> Sito in arrivo</div>

        <h1>
          Stiamo costruendo <em>il nuovo ponte</em>.
        </h1>

        <p className="coming-soon-lead">
          La nuova versione del sito de Il Ponte Pedagogico è quasi pronta: percorsi,
          tariffe e prenotazione online stanno prendendo forma. Nel frattempo puoi
          scrivermi direttamente, ci sono già.
        </p>

        <div className="coming-soon-actions">
          <a className="button primary" href={whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon /> Scrivimi su WhatsApp
          </a>
          <a className="button ghost" href={`mailto:${contact.email}`}>Scrivi un’email</a>
        </div>

        <a
          className="coming-soon-instagram"
          href={contact.instagramUrl}
          target="_blank"
          rel="noreferrer"
        >
          <InstagramIcon /> {contact.instagramHandle}
        </a>
      </div>

      <p className="coming-soon-note">
        Dott.ssa Noemi Urboni · Pedagogista — Consulenza Pedagogica, Parent Coaching, Supporto ABA
      </p>
    </main>
  );
}
