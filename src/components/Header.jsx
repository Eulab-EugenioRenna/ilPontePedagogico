import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '#chi-sono', label: 'Chi sono' },
  { href: '#servizi', label: 'Servizi' },
  { href: '#metodo', label: 'Metodo' },
  { href: '#contatti', label: 'Contatti' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const closeOnOutsidePointer = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };

    const desktopQuery = window.matchMedia('(min-width: 941px)');
    const closeOnDesktop = (event) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    if (desktopQuery.matches) setOpen(false);
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', closeOnDesktop);
    } else {
      desktopQuery.addListener(closeOnDesktop);
    }

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      if (desktopQuery.removeEventListener) {
        desktopQuery.removeEventListener('change', closeOnDesktop);
      } else {
        desktopQuery.removeListener(closeOnDesktop);
      }
    };
  }, [open]);

  return (
    <header ref={headerRef} className={open ? 'site-header is-menu-open' : 'site-header'}>
      <a className="brand" href="#top" aria-label="Torna all’inizio">
        <span className="brand-mark" aria-hidden="true">∩</span>
        <span>
          <strong>Il Ponte</strong>
          <small>Pedagogico</small>
        </span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav id="main-nav" className={open ? 'nav is-open' : 'nav'} aria-label="Menu principale">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="nav-cta" href="#prenota" onClick={() => setOpen(false)}>Prenota 15 min</a>
      </nav>
    </header>
  );
}
