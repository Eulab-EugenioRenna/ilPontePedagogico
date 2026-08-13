import { rotatingWords } from '../data/siteContent.js';
import { useTypewriterWord } from '../hooks/useRotatingWord.js';

export default function Hero({ onPrimary }) {
  const word = useTypewriterWord(rotatingWords);

  return (
    <section id="top" className="hero section-shell">
      <div className="hero-copy" data-reveal>
        <div className="eyebrow"><span /> Noemi Urboni · Pedagogista ABA</div>
        <h1>
          <span className="sr-only">
            Capire cosa accade. Costruire routine più serene, strategie concrete, autonomie possibili e una scuola più inclusiva.
          </span>
          <span aria-hidden="true">
            Capire cosa accade. Costruire <em className="typewriter-word">{word}</em>
          </span>
        </h1>
        <p className="hero-lead">
          Se una routine, un comportamento o il rapporto con lo studio sono diventati fonte di fatica, non devi avere già una risposta. Partiamo da ciò che accade e costruiamo strategie applicabili ogni giorno.
        </p>
        <div className="hero-actions">
          <button className="button primary" type="button" onClick={onPrimary}>Capisci da dove iniziare</button>
          <a className="button ghost" href="#metodo">Come lavoreremo insieme</a>
        </div>
        <div className="trust-row" aria-label="Aree di intervento">
          <span>0-3 anni</span>
          <span>Parent Coaching</span>
          <span>Supporto ABA</span>
          <span>Scuola 6-18</span>
        </div>
      </div>

      <aside id="chi-sono" className="portrait-card hero-profile" data-reveal aria-labelledby="hero-profile-title">
        <div className="hero-profile-photo">
          <img
            src="/shooting-noemi-13.jpg"
            alt="Noemi Urboni durante un’attività educativa"
          />
          <span className="hero-profile-badge">7+ anni<br />di esperienza</span>
        </div>
        <div className="hero-profile-copy">
          <span className="section-kicker">Chi sono</span>
          <h2 id="hero-profile-title">Prima di agire, bisogna capire.</h2>
          <p>
            Mi chiamo <strong>Noemi Urboni</strong>. Unisco Pedagogia, Analisi del Comportamento Applicata — ABA e insegnamento per leggere ogni bisogno da più prospettive.
          </p>
          <a className="hero-profile-link" href="#metodo">Scopri il mio approccio <span aria-hidden="true">→</span></a>
        </div>
      </aside>
    </section>
  );
}
