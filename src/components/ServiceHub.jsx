import ServiceExplorer from './ServiceExplorer.jsx';
import Pricing from './Pricing.jsx';
import { seoPages } from '../../config/seo-pages.js';

/**
 * Sezione unificata: servizi con tariffe + pacchetti famiglia.
 * Prenotazione e contatti stanno insieme in fondo alla pagina.
 */
export default function ServiceHub({ selectedServiceId, onSelectService, onServiceCta, onBook }) {
  return (
    <section id="servizi" className="service-hub section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Servizi, tariffe e pacchetti</span>
        <h2>Scegli il percorso e guarda la tariffa.</h2>
        <p>
          Qui trovi i servizi con i relativi costi e i pacchetti famiglia. Quando hai
          chiaro il percorso, in fondo alla pagina puoi prenotare o scrivermi.
        </p>
      </div>

      <ServiceExplorer
        selectedServiceId={selectedServiceId}
        onSelect={onSelectService}
        onCta={onServiceCta}
      />

      <Pricing onBook={onBook} />
      <nav className="service-related" aria-label="Approfondimenti sui servizi">
        <h3>Approfondisci il percorso</h3>
        {seoPages.map((page) => <a key={page.path} href={page.path}>{page.label}</a>)}
      </nav>
    </section>
  );
}
