import { credentials } from '../data/siteContent.js';

export default function About() {
  return (
    <section id="chi-sono" className="about section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Chi sono</span>
        <h2>Prima di agire, bisogna capire.</h2>
      </div>

      <div className="about-layout">
        <article className="story-panel" data-reveal>
          <div className="about-photo-composition" aria-label="Noemi Urboni durante alcune attività educative">
            <figure className="about-photo about-photo-primary">
              <img src="/shooting-noemi-13.jpg" alt="Noemi Urboni durante un’attività educativa con giochi e bolle di sapone" />
            </figure>
            <figure className="about-photo about-photo-secondary">
              <img src="/shooting-noemi-15.jpg" alt="Noemi Urboni con materiali educativi" />
            </figure>
            <span className="about-photo-caption">Osservare<br />prima di agire</span>
          </div>
          <p className="lead-text">
            Quando una situazione educativa diventa faticosa, un consiglio generico serve a poco. Il mio lavoro è aiutarti a capire cosa sta accadendo e trasformare questa lettura in passi che puoi davvero sostenere.
          </p>
          <p>
            Mi chiamo <strong>Noemi Urboni</strong>. La formazione in <strong>Pedagogia</strong>, <strong>Analisi del Comportamento Applicata — ABA</strong> e insegnamento mi permette di leggere il bisogno da più prospettive: sviluppo, comportamento, relazioni e scuola.
          </p>
          <p>
            Da oltre sette anni lavoro nella scuola e nel privato sociale. Ogni percorso parte dall’ascolto del contesto, perché una strategia può funzionare solo se rispetta la persona e la vita quotidiana in cui dovrà entrare.
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
