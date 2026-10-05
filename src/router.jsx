import { useEffect, useState } from 'react';

/** Pathname reattivo (supporta back/forward del browser). */
export function usePathname(initialPath = '/') {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? initialPath : window.location.pathname,
  );

  useEffect(() => {
    const onChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  return pathname;
}

/** Navigazione client-side senza ricaricare la pagina. */
export function navigate(to) {
  if (typeof window === 'undefined') return;
  if (to === window.location.pathname) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0 });
}

/** True se il pathname (senza slash finale) corrisponde. */
export function matchesPath(pathname, target) {
  return pathname.replace(/\/+$/, '') === target;
}
