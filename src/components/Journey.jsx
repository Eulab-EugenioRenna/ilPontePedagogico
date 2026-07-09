const steps = [
  {
    title: 'Racconti il bisogno',
    text: 'Un primo confronto serve a capire cosa sta succedendo, quali sono le priorità e cosa rende la situazione faticosa.',
  },
  {
    title: 'Costruiamo una mappa',
    text: 'Il bisogno viene tradotto in obiettivi, strategie e passaggi concreti, coerenti con famiglia, scuola o contesto educativo.',
  },
  {
    title: 'Porti gli strumenti nella vita reale',
    text: 'Il percorso accompagna l’applicazione, così le strategie diventano competenze e non restano teoria.',
  },
];

export default function Journey() {
  return (
    <section className="journey section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Percorso</span>
        <h2>Dal primo messaggio a un piano d’azione chiaro.</h2>
      </div>
      <div className="journey-line" data-reveal>
        {steps.map((step, index) => (
          <article className="journey-step" key={step.title}>
            <span>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
