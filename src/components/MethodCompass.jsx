import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { methodTabs } from '../data/siteContent.js';

gsap.registerPlugin(ScrollTrigger);

export default function MethodCompass() {
  const [activeId, setActiveId] = useState(methodTabs[0].id);
  const sectionRef = useRef(null);
  const blockRef = useRef(null);
  const triggerRef = useRef(null);
  const active = methodTabs.find((tab) => tab.id === activeId) ?? methodTabs[0];

  useEffect(() => {
    const section = sectionRef.current;
    const block = blockRef.current;
    if (!section || !block) return undefined;

    const context = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 941px)', () => {
        triggerRef.current = ScrollTrigger.create({
          id: 'method-scroll-trigger',
          trigger: block,
          pin: block,
          start: 'top top+=96',
          end: () => `+=${methodTabs.length * 520}`,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(methodTabs.length - 1, Math.floor(self.progress * methodTabs.length));
            setActiveId((current) => (current === methodTabs[index].id ? current : methodTabs[index].id));
          },
        });

        return () => {
          triggerRef.current?.kill();
          triggerRef.current = null;
        };
      });

      return () => mm.revert();
    }, section);

    return () => context.revert();
  }, []);

  const scrollToItem = (id, index) => {
    setActiveId(id);

    const trigger = triggerRef.current;
    if (!trigger) return;

    const progress = methodTabs.length === 1 ? 0 : index / methodTabs.length + 0.01;
    const target = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <section id="metodo" className="method section-shell" ref={sectionRef}>
      <div className="method-card block-section" ref={blockRef}>
        <div className="section-heading align-left method-heading">
          <span className="section-kicker">Metodo</span>
          <h2>Nessun modello rigido. Solo percorsi costruiti sulla persona.</h2>
          <p>
            Il pedagogista è un ponte: collega il sapere scientifico alle esigenze concrete della vita di tutti i giorni.
          </p>
        </div>

        <div className="method-columns">
          <div className="method-items" aria-label="Fasi del metodo">
            {methodTabs.map((tab, index) => (
              <button
                key={tab.id}
                className={tab.id === activeId ? 'scroll-item is-active' : 'scroll-item'}
                type="button"
                onClick={() => scrollToItem(tab.id, index)}
              >
                <span className="scroll-item-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="scroll-item-copy">
                  <small>{tab.eyebrow}</small>
                  <strong>{tab.title}</strong>
                </span>
              </button>
            ))}
          </div>

          <article className="scroll-section" aria-live="polite">
            <span>{active.eyebrow}</span>
            <h3>{active.title}</h3>
            <p>{active.text}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
