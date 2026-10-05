import { useEffect } from 'react';
import { pageSeo, renderSeoHead } from '../../config/seo.js';
import { contact } from '../data/siteContent.js';

export default function Seo({ pathname, comingSoon }) {
  useEffect(() => {
    const template = document.createElement('template');
    template.innerHTML = renderSeoHead(pageSeo(pathname, comingSoon), contact);
    document.head.querySelectorAll('[data-site-seo]').forEach((node) => node.remove());
    document.head.appendChild(template.content);
  }, [pathname, comingSoon]);
  return null;
}
