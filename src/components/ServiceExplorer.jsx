import { useMemo, useState } from 'react';
import { services } from '../data/siteContent.js';
import { formatPrice } from '../../config/listino.js';

const areas = ['Tutti', ...Array.from(new Set(services.map((service) => service.area)))];

export default function ServiceExplorer({ selectedServiceId, onSelect, onCta }) {
  const [area, setArea] = useState('Tutti');
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const filtered = useMemo(
    () => (area === 'Tutti' ? services : services.filter((service) => service.area === area)),
    [area],
  );

  return (
    <div className="service-explorer">
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
              <span className="service-card-price">
                Prima {formatPrice(service.price.first)} · Monitoraggio {formatPrice(service.price.followUp)}
              </span>
            </button>
          ))}
        </div>

        <article className="service-detail" data-reveal aria-live="polite">
          <span className="detail-label">Da qui possiamo partire</span>
          <h3>{selectedService.title}</h3>
          <p className="detail-promise">{selectedService.promise}</p>

          <div className="detail-columns">
            <div>
              <h4>Può aiutarti se</h4>
              <ul>
                {selectedService.goodFor.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Cosa faremo</h4>
              <ol>
                {selectedService.steps.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </div>
          </div>

          <div className="detail-price">
            <div>
              <small>{selectedService.firstLabel ?? 'Prima Consulenza'}</small>
              <strong>{formatPrice(selectedService.price.first)}</strong>
              <span>60 min + relazione specifica</span>
            </div>
            <div>
              <small>{selectedService.followUpLabel ?? 'Incontro di Monitoraggio'}</small>
              <strong>{formatPrice(selectedService.price.followUp)}</strong>
              <span>60 minuti</span>
            </div>
          </div>

          <button className="button primary full" type="button" onClick={() => onCta(selectedService.id)}>
            {selectedService.cta}
          </button>
        </article>
      </div>
    </div>
  );
}
