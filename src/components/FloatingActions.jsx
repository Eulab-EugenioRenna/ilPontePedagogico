import { contact } from '../data/siteContent.js';
import { InstagramIcon, WhatsAppIcon } from './SocialIcons.jsx';

export default function FloatingActions({ selectedService }) {
  const message = `Ciao Noemi, vorrei ricevere informazioni su: ${selectedService.title}.`;
  const url = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="floating-actions" aria-label="Azioni rapide">
      <a href="#contatti" className="floating-pill">Inizia da qui</a>
      <a href={contact.instagramUrl} className="floating-instagram" target="_blank" rel="noreferrer" aria-label="Apri Instagram">
        <InstagramIcon />
      </a>
      <a href={url} className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Scrivi su WhatsApp">
        <WhatsAppIcon />
      </a>
    </div>
  );
}
