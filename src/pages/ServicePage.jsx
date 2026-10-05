import { faqs, serviceArea } from '../../config/seo.js';
import { seoPages } from '../../config/seo-pages.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function ServicePage({ page }) {
  return (
    <>
      <Header homePrefix="/" />
      <main className="service-page section-shell">
        <nav className="service-breadcrumb" aria-label="Percorso pagina"><a href="/">Il Ponte Pedagogico</a><span aria-hidden="true"> / </span><span>{page.label}</span></nav>
        <article>
          <span className="section-kicker">Dott.ssa Noemi Urboni · Pedagogista</span>
          <h1>{page.heading}</h1>
          <p className="service-page-intro">{page.intro}</p>
          {page.sections.map((section) => (
            <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>
          ))}
          <section className="faq">
            <h2>Domande frequenti</h2>
            <div className="faq-list">{page.faqIndexes.map((index) => (
              <details key={index}><summary>{faqs[index].question}</summary><p>{faqs[index].answer}</p></details>
            ))}</div>
          </section>
          <p>{serviceArea}</p>
          <div className="hero-actions">
            <a className="button primary" href="/#prenota">Prenota 15 minuti gratuiti</a>
            <a className="button ghost" href="/#servizi">Servizi e tariffe</a>
            <a href="/#contatti">Scrivi a Noemi</a>
          </div>
        </article>
        <nav className="service-related" aria-label="Altri percorsi"><h2>Altri percorsi educativi</h2>{seoPages.filter((item) => item.path !== page.path).map((item) => <a key={item.path} href={item.path}>{item.label}</a>)}</nav>
      </main>
      <Footer homePrefix="/" />
    </>
  );
}
