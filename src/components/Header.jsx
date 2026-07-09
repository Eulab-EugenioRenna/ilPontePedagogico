import { useState } from 'react';

const links = [
  { href: '#chi-sono', label: 'Chi sono' },
  { href: '#servizi', label: 'Servizi' },
  { href: '#metodo', label: 'Metodo' },
  { href: '#storie', label: 'Storie' },
  { href: '#contatti', label: 'Contatti' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Torna all’inizio">
        <span className="brand-mark" aria-hidden="true">∩</span>
        <span>
          <strong>Il Ponte</strong>
          <small>Pedagogico</small>
        </span>
      </a>

      <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="main-nav">
        <span />
        <span />
        <span />
        <span className="sr-only">Apri menu</span>
      </button>

      <nav id="main-nav" className={open ? 'nav is-open' : 'nav'} aria-label="Menu principale">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="nav-cta" href="#contatti" onClick={() => setOpen(false)}>Prenota una consulenza</a>
      </nav>
    </header>
  );
}
