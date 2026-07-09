import { rotatingWords } from '../data/siteContent.js';
import { useRotatingWord } from '../hooks/useRotatingWord.js';

export default function Hero({ onPrimary }) {
  const word = useRotatingWord(rotatingWords);

  return (
    <section id="top" className="hero section-shell">
      <div className="hero-copy" data-reveal>
        <div className="eyebrow"><span /> Consulenza pedagogica personalizzata</div>
        <h1>
          Tradurre la pedagogia in <em key={word}>{word}</em>
        </h1>
        <p className="hero-lead">
          Sono <strong>Noemi Urboni</strong>, pedagogista specializzata in ABA. <br /> Aiuto famiglie, educatori e insegnanti a trasformare bisogni educativi complessi in percorsi chiari, sostenibili e applicabili nella vita quotidiana.
        </p>
        <div className="hero-actions">
          <button className="button primary" type="button" onClick={onPrimary}>Trova il percorso adatto</button>
          <a className="button ghost" href="#metodo">Scopri il metodo</a>
        </div>
        <div className="trust-row" aria-label="Aree di intervento">
          <span>0-3 anni</span>
          <span>Parent Coaching</span>
          <span>Supporto ABA</span>
          <span>Scuola 6-18</span>
        </div>
      </div>

      <div className="hero-visual" data-reveal>
        <div className="orb orb-rose" />
        <div className="orb orb-sage" />
        <div className="orb orb-powder" />
        <div className="portrait-card">
          <div className="bridge-illustration" aria-hidden="true">
            <svg viewBox="0 0 420 320" role="img" aria-label="Illustrazione minimal di un ponte pedagogico">
              <defs>
                <linearGradient id="bridgeGradient" x1="0" x2="1">
                  <stop offset="0" stopColor="#e7cfc7" />
                  <stop offset="0.55" stopColor="#b9c8b5" />
                  <stop offset="1" stopColor="#c9d7dd" />
                </linearGradient>
              </defs>
              <path className="bridge-arc" d="M54 223C120 106 300 106 366 223" />
              <path className="bridge-deck" d="M85 228H335" />
              <path className="bridge-line line-a" d="M122 213L140 158" />
              <path className="bridge-line line-b" d="M210 202V132" />
              <path className="bridge-line line-c" d="M298 213L280 158" />
              <circle cx="112" cy="118" r="31" fill="#e7cfc7" />
              <circle cx="308" cy="118" r="31" fill="#c9d7dd" />
              <circle cx="210" cy="84" r="24" fill="#b9c8b5" />
              <path d="M119 119c28 35 152 35 180 0" fill="none" stroke="url(#bridgeGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="4 18" />
            </svg>
          </div>
          <div className="hero-note note-one">
            <small>Da bisogno a percorso</small>
            <strong>ascolto → strategia → autonomia</strong>
          </div>
          <div className="hero-note note-two">
            <small>Approccio</small>
            <strong>scientifico, umano, concreto</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
