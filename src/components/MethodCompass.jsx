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
          <h2>Prima di scegliere cosa fare, capiamo cosa sta succedendo.</h2>
          <p>
            Non esistono strategie valide per tutti. Osserviamo il bisogno, il contesto e ciò che mantiene la difficoltà, poi trasformiamo questa lettura in azioni possibili.
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
            <div className="scroll-section-copy">
              <span>{active.eyebrow}</span>
              <h3>{active.title}</h3>
              <p>{active.text}</p>
            </div>
            <figure className="method-photo">
              <img src="/shooting-noemi-3.jpg" alt="Noemi Urboni durante la programmazione di un percorso pedagogico" />
              <figcaption>Dal bisogno a un piano possibile</figcaption>
            </figure>
          </article>
        </div>
      </div>
    </section>
  );
}
