const steps = [
  {
    title: 'Mi racconti cosa succede',
    text: 'Non servono parole tecniche o una diagnosi già chiara. Partiamo dagli episodi, dai dubbi e dai momenti che oggi ti mettono più in difficoltà.',
  },
  {
    title: 'Diamo un senso a ciò che osservi',
    text: 'Mettiamo in relazione comportamenti, contesto e priorità per capire dove intervenire e quale cambiamento cercare per primo.',
  },
  {
    title: 'Proviamo strategie sostenibili',
    text: 'Le indicazioni entrano nella quotidianità e vengono osservate nel tempo, così possiamo capire cosa funziona e cosa va adattato.',
  },
];

export default function Journey() {
  return (
    <section className="journey section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Dopo il primo messaggio</span>
        <h2>Non devi arrivare con una soluzione. La costruiamo un passo alla volta.</h2>
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
