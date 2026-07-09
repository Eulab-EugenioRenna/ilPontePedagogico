import { audience } from '../data/siteContent.js';

export default function Audience() {
  return (
    <section className="audience section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">A chi si rivolge</span>
        <h2>Per chi cerca una guida, non una risposta generica.</h2>
      </div>
      <div className="audience-cloud" data-reveal>
        {audience.map((item, index) => (
          <span key={item} style={{ '--i': index }}>{item}</span>
        ))}
      </div>
    </section>
  );
}
