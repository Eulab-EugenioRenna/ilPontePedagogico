import { familyPackages, formatPrice, listinoMeta } from '../../config/listino.js';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="price-check" aria-hidden="true">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Blocco prezzi/pacchetti pensato per essere annidato nella sezione unificata
 * (`ServiceHub`): nessuna intestazione di sezione, nessun wrapper <section>.
 */
export default function Pricing({ onBook }) {
  return (
    <div className="pricing-block" data-reveal>
      <div className="price-strip">
        <div className="price-strip-item">
          <small>Prima Consulenza / Valutazione</small>
          <strong>{formatPrice(listinoMeta.firstConsultationPrice)}</strong>
          <span>60 minuti + relazione specifica</span>
        </div>
        <div className="price-strip-item">
          <small>Incontro di Monitoraggio</small>
          <strong>{formatPrice(listinoMeta.monitoringPrice)}</strong>
          <span>60 minuti</span>
        </div>
        <div className="price-strip-item is-free">
          <small>{listinoMeta.freeIntro.title}</small>
          <strong>Gratuito</strong>
          <span>{listinoMeta.freeIntro.durationMinutes} minuti, senza impegno</span>
        </div>
      </div>

      <div className="packages-heading">
        <span className="section-kicker">Proposte per le famiglie</span>
        <h3>Pacchetti e agevolazioni famiglia</h3>
        <p>Soluzioni pensate per sostenere le famiglie con percorsi continui, dilazioni e flessibilità.</p>
      </div>

      <div className="packages-grid">
        {familyPackages.map((pkg) => (
          <article
            className={pkg.highlight ? 'package-card is-highlight' : 'package-card'}
            key={pkg.id}
          >
            <header className="package-head">
              <span className="package-badge">{pkg.badge}</span>
              {pkg.saving > 0 && (
                <span className="package-saving">−{formatPrice(pkg.saving)} di sconto</span>
              )}
            </header>
            <h4>{pkg.title}</h4>
            <p className="package-tagline">{pkg.tagline}</p>
            <ul className="package-features">
              {pkg.features.map((feature) => (
                <li key={feature}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="package-price">
              <span>Valore {formatPrice(pkg.value)}</span>
              <strong>{formatPrice(pkg.price)}</strong>
            </div>
            {pkg.highlight && pkg.highlightLabel && (
              <span className="package-flag">{pkg.highlightLabel}</span>
            )}
            <button className="button primary full" type="button" onClick={() => onBook?.(pkg.title)}>
              Prenota 15 min gratuiti
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
