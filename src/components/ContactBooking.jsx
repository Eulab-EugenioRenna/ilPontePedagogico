import Booking from './Booking.jsx';
import Contact from './Contact.jsx';

/**
 * Sezione finale: "Prenota o contatta". Prenotazione 15 minuti e form di
 * contatto convivono qui, in due tab, in fondo alla pagina.
 * L'anchor `#contatti` punta alla sezione, `#prenota` apre il tab prenotazione.
 */
export default function ContactBooking({
  actionTab,
  onActionTabChange,
  selectedService,
  onSelectService,
  bookingTopic,
  onBookingTopicChange,
}) {
  const isBook = actionTab !== 'contact';

  return (
    <section id="contatti" className="contact-hub section-shell">
      <span id="prenota" className="action-anchor" aria-hidden="true" />

      <div className="section-heading" data-reveal>
        <span className="section-kicker">Prenota o contatta</span>
        <h2>Il primo passo, come preferisci tu</h2>
        <p>
          Prenota l’incontro conoscitivo gratuito di 15 minuti oppure scrivimi
          direttamente: in entrambi i casi partiamo da ciò che ti sta a cuore.
        </p>
      </div>

      <div className="action-tabs-row">
        <div className="action-tabs" role="tablist" aria-label="Prenota o contatta">
          <button
            type="button"
            role="tab"
            aria-selected={isBook}
            className={isBook ? 'action-tab is-active' : 'action-tab'}
            onClick={() => onActionTabChange('book')}
          >
            Prenota 15 min
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isBook}
            className={isBook ? 'action-tab' : 'action-tab is-active'}
            onClick={() => onActionTabChange('contact')}
          >
            Scrivimi
          </button>
        </div>
      </div>

      <div className="action-panel" role="tabpanel" hidden={!isBook}>
        <Booking topic={bookingTopic} onTopicChange={onBookingTopicChange} />
      </div>
      <div className="action-panel" role="tabpanel" hidden={isBook}>
        <Contact selectedService={selectedService} onSelectService={onSelectService} />
      </div>
    </section>
  );
}
