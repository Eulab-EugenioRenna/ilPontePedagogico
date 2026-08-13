import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import NeedNavigator from './components/NeedNavigator.jsx';
import ServiceExplorer from './components/ServiceExplorer.jsx';
import MethodCompass from './components/MethodCompass.jsx';
import Audience from './components/Audience.jsx';
import Journey from './components/Journey.jsx';
import SocialProof from './components/SocialProof.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import { services } from './data/siteContent.js';
import { useReveal } from './hooks/useReveal.js';

export default function App() {
  useReveal();
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId],
  );

  const selectAndScroll = (id, target = 'contatti') => {
    setSelectedServiceId(id);
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero onPrimary={() => document.getElementById('servizi')?.scrollIntoView({ behavior: 'smooth' })} />
        <NeedNavigator onChoose={(id) => selectAndScroll(id, 'servizi')} />
        <ServiceExplorer
          selectedServiceId={selectedServiceId}
          onSelect={setSelectedServiceId}
          onCta={(id) => selectAndScroll(id, 'contatti')}
        />
        <MethodCompass />
        <Audience />
        <Journey />
        <SocialProof />
        <Contact selectedService={selectedService} onSelectService={setSelectedServiceId} />
      </main>
      <FloatingActions selectedService={selectedService} />
      <Footer />
    </>
  );
}
