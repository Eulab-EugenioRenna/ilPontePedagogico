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

    </section>
  );
}
