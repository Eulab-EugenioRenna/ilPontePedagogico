import { audience } from '../data/siteContent.js';

export default function Audience() {
  return (
    <section className="audience section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Ti riconosci?</span>
        <h2>Potresti essere nel posto giusto se continuare per tentativi non basta.</h2>
      </div>
      <div className="audience-cloud" data-reveal>
        {audience.map((item, index) => (
          <span key={item} style={{ '--i': index }}>{item}</span>
        ))}
      </div>
    </section>
  );
}
