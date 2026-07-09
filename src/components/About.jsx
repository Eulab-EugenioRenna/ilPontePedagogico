import { credentials } from '../data/siteContent.js';

export default function About() {
  return (
    <section id="chi-sono" className="about section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Chi sono</span>
        <h2>Un ponte tra conoscenza scientifica, esperienza sul campo e bisogni reali.</h2>
      </div>

      <div className="about-layout">
        <article className="story-panel" data-reveal>
          <figure className="about-photo">
            <img src="/noemi.jpg" alt="Noemi Urboni, pedagogista" />
          </figure>
          <p className="lead-text">
            Benvenuti su <strong>Il Ponte Pedagogico</strong>. Il mio nome è <strong>Noemi Urboni</strong> e il mio lavoro consiste nel tradurre la pedagogia in strumenti concreti per le famiglie, gli educatori e gli insegnanti.
          </p>
          <p>
            La mia attività nasce dall’unione tra una solida base accademica e una passione autentica per l’essere umano, in tutte le sue fasi di sviluppo. Sono una <strong>Pedagogista</strong>, specializzata in <strong>Analisi del Comportamento Applicata — ABA</strong> e docente abilitata all’insegnamento di Filosofia e Scienze Umane.
          </p>
          <p>
            Da oltre sette anni opero nel mondo della scuola e del privato sociale. Ho lavorato con contesti di neurosviluppo differenti, trasformando ogni caso clinico o didattico in una nuova opportunità di ricerca e apprendimento.
          </p>
        </article>

        <aside className="credential-board" data-reveal>
          <div className="credential-main">
            <strong>7+</strong>
            <span>anni di esperienza tra scuola e privato sociale</span>
          </div>
          <div className="credential-list">
            {credentials.map((item, index) => (
              <div className="credential-item" key={item} style={{ '--i': index + 1 }}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
