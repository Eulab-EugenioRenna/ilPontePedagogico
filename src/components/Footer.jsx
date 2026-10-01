import { contact } from '../data/siteContent.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Il Ponte Pedagogico</strong>
        <p>Dott.ssa Noemi Urboni — Consulenza Pedagogica, Parent Coaching, Supporto ABA e Supervisione Pedagogica.</p>
      </div>
      <nav aria-label="Link footer">
        <a href={contact.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        <a href="/appuntamenti">Area appuntamenti</a>
        <a href="#contatti">Contatti</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Cookie Policy</a>
      </nav>
      <small>Il Ponte Pedagogico © 2026 — Tutti i diritti riservati.</small>
    </footer>
  );
}
