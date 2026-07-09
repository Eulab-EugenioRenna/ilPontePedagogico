import { caseStudies, photoStories, reviews } from '../data/siteContent.js';

export default function SocialProof() {
  return (
    <section id="storie" className="proof section-shell">
      <div className="section-heading" data-reveal>
        <span className="section-kicker">Storie reali</span>
        <h2>Spazi pronti per foto, casi studio e recensioni.</h2>
        <p>
          Una sezione pensata per mostrare percorsi, trasformazioni e parole delle famiglie senza perdere delicatezza.
        </p>
      </div>

      <div className="proof-layout" data-reveal>
        <div className="photo-board" aria-label="Box foto dei percorsi">
          {photoStories.map((story) => (
            <article className={`photo-card ${story.tone}`} key={story.title}>
              <div className="photo-frame">
                {story.image ? <img src={story.image} alt={story.alt} /> : <span>Foto</span>}
              </div>
              <small>{story.label}</small>
              <h3>{story.title}</h3>
              <p>{story.text}</p>
            </article>
          ))}
        </div>

        <div className="case-board" aria-label="Casi studio">
          {caseStudies.map((item) => (
            <article className="case-card" key={item.title}>
              <span>{item.tag}</span>
              <strong>{item.metric}</strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="review-grid" data-reveal aria-label="Recensioni">
        {reviews.map((review) => (
          <figure className="review-card" key={review.name}>
            <blockquote>“{review.quote}”</blockquote>
            <figcaption>{review.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
