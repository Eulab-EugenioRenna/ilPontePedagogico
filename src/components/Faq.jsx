import { faqs, serviceArea } from '../../config/seo.js';

export default function Faq() {
  return (
    <section id="domande-frequenti" className="faq section-shell" aria-labelledby="faq-title">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Le domande da cui partire</span>
        <h2 id="faq-title">Un primo orientamento per genitori e famiglie.</h2>
        <p>{serviceArea}</p>
      </div>
      <div className="faq-list">
        {faqs.map(({ question, answer }) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <p className="faq-contact"><a href="#contatti">Raccontami la tua situazione</a> oppure <a href="#prenota">prenota 15 minuti gratuiti</a>.</p>
    </section>
  );
}
