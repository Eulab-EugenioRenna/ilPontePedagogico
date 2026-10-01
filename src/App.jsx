import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import NeedNavigator from './components/NeedNavigator.jsx';
import ServiceHub from './components/ServiceHub.jsx';
import MethodCompass from './components/MethodCompass.jsx';
import Audience from './components/Audience.jsx';
import Journey from './components/Journey.jsx';
import SocialProof from './components/SocialProof.jsx';
import ContactBooking from './components/ContactBooking.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Appointments from './pages/Appointments.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import { services } from './data/siteContent.js';
import { comingSoon } from './config/flags.js';
import { bookingTopics } from '../config/listino.js';
import { matchesPath, usePathname } from './router.jsx';
import { useReveal } from './hooks/useReveal.js';

export default function App() {
  useReveal();
  const pathname = usePathname();
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [bookingTopic, setBookingTopic] = useState(bookingTopics[0]);
  const [actionTab, setActionTab] = useState('book');

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId],
  );

  // #prenota apre il tab prenotazione, #contatti apre il tab form.
  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === '#contatti') setActionTab('contact');
      else if (window.location.hash === '#prenota') setActionTab('book');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const scrollToId = (id) => {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const openBooking = (topic) => {
    if (typeof topic === 'string' && bookingTopics.includes(topic)) setBookingTopic(topic);
    setActionTab('book');
    scrollToId('prenota');
  };

  const handleServiceCta = (id) => {
    const service = services.find((item) => item.id === id);
    setSelectedServiceId(id);
    if (service) setBookingTopic(service.title);
    openBooking();
  };

  if (matchesPath(pathname, '/appuntamenti')) {
    return (
      <>
        <ScrollProgress />
        <Appointments />
      </>
    );
  }

  // Modalità "in arrivo" (VITE_COMING_SOON): sostituisce la landing pubblica
  // ma lascia raggiungibile il pannello interno /appuntamenti.
  if (comingSoon) {
    return <ComingSoon />;
  }

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero onPrimary={() => scrollToId('servizi')} />
        <NeedNavigator onChoose={(id) => { setSelectedServiceId(id); scrollToId('servizi'); }} />
        <ServiceHub
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          onServiceCta={handleServiceCta}
          onBook={openBooking}
        />
        <MethodCompass />
        <Audience />
        <Journey />
        {/* <SocialProof /> */}
        <ContactBooking
          actionTab={actionTab}
          onActionTabChange={setActionTab}
          selectedService={selectedService}
          onSelectService={setSelectedServiceId}
          bookingTopic={bookingTopic}
          onBookingTopicChange={setBookingTopic}
        />
      </main>
      <FloatingActions selectedService={selectedService} />
      <Footer />
    </>
  );
}
