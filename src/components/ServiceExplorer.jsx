import { useMemo, useState } from 'react';
import { services } from '../data/siteContent.js';

const areas = ['Tutti', ...Array.from(new Set(services.map((service) => service.area)))];

export default function ServiceExplorer({ selectedServiceId, onSelect, onCta }) {
  const [area, setArea] = useState('Tutti');
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const filtered = useMemo(() => (area === 'Tutti' ? services : services.filter((service) => service.area === area)), [area]);

  return (
    <section id="servizi" className="services section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Servizi</span>
        <h2>Non un elenco di prestazioni: un modo per orientarti nel bisogno.</h2>
        <p>Ogni card apre un dettaglio operativo per capire subito a cosa serve il percorso e quale risultato vuole generare.</p>
      </div>

      <div className="service-filters" data-reveal aria-label="Filtra i servizi per area">
        {areas.map((item) => (
          <button key={item} className={item === area ? 'is-active' : ''} type="button" onClick={() => setArea(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="service-workspace">
        <div className="service-list" data-reveal>
          {filtered.map((service) => (
            <button
              type="button"
              key={service.id}
              className={service.id === selectedServiceId ? 'service-card is-selected' : 'service-card'}
              onClick={() => onSelect(service.id)}
            >
              <span>{service.area}</span>
              <strong>{service.title}</strong>
              <p>{service.short}</p>
            </button>
          ))}
        </div>

        <article className="service-detail" data-reveal aria-live="polite">
          <span className="detail-label">Percorso selezionato</span>
          <h3>{selectedService.title}</h3>
          <p className="detail-promise">{selectedService.promise}</p>

          <div className="detail-columns">
            <div>
              <h4>Utile per</h4>
              <ul>
                {selectedService.goodFor.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Come si lavora</h4>
              <ol>
                {selectedService.steps.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </div>
          </div>

          <button className="button primary full" type="button" onClick={() => onCta(selectedService.id)}>
            {selectedService.cta}
          </button>
        </article>
      </div>
    </section>
  );
}
