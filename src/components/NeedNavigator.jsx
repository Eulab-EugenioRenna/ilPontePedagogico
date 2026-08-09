import { insightCards, services } from '../data/siteContent.js';

const serviceMap = {
  'Consulenza 0-3 anni': 'zero-tre',
  'Supporto allo studio': 'studio',
  'Supporto ABA': 'aba',
};

export default function NeedNavigator({ onChoose }) {
  return (
    <section className="need-strip" aria-labelledby="need-title">
      <div className="section-heading compact" data-reveal>
        <span className="section-kicker">Partiamo da ciò che accade</span>
        <h2 id="need-title">Qual è il momento che oggi pesa di più?</h2>
      </div>
      <div className="need-grid">
        {insightCards.map((card, index) => (
          <button
            className="need-card"
            key={card.label}
            type="button"
            data-reveal
            style={{ '--delay': `${index * 80}ms` }}
            onClick={() => onChoose(serviceMap[card.service] ?? services[0].id)}
          >
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.text}</p>
            <small>{card.service} →</small>
          </button>
        ))}
      </div>
    </section>
  );
}
