import { useEffect } from 'react';

/**
 * Rivelazione progressiva allo scroll per gli elementi `[data-reveal]`.
 *
 * Il trigger scatta su una "banda" centrale del viewport (rootMargin negativo
 * simmetrico) così l'animazione parte e finisce al centro dello schermo, senza
 * scatti ai bordi. Osserva anche i nodi aggiunti dinamicamente.
 */
export function useReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = (element) => element.classList.add('is-visible');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Banda centrata: scatta quando l'elemento entra nella parte centrale
        // del viewport, così ingresso e uscita restano fluidi.
        rootMargin: '-8% 0px -16% 0px',
        threshold: 0,
      },
    );

    const observeWithin = (root) => {
      root
        .querySelectorAll('[data-reveal]:not(.is-visible)')
        .forEach((element) => observer.observe(element));
    };

    if (prefersReduced) {
      document.querySelectorAll('[data-reveal]').forEach(reveal);
      return undefined;
    }

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

    // Rete di sicurezza: garantisce che nulla resti nascosto vicino al fondo
    // pagina, anche se l'elemento non raggiunge la banda centrale.
    let ticking = false;
    const sweep = () => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) reveal(element);
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sweep();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const mutation = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) observer.observe(node);
          observeWithin(node);
        });
      });
    });

    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
