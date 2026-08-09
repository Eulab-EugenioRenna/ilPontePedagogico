import { useEffect, useState } from 'react';

export function useTypewriterWord(
  words,
  { typingDelay = 82, deletingDelay = 46, holdDelay = 1350, gapDelay = 280 } = {},
) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);

    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!words.length || reduceMotion) return undefined;

    const currentWord = words[wordIndex];
    let delay = typingDelay;
    let nextStep;

    if (phase === 'typing' && text.length < currentWord.length) {
      nextStep = () => setText(currentWord.slice(0, text.length + 1));
    } else if (phase === 'typing') {
      delay = holdDelay;
      nextStep = () => setPhase('deleting');
    } else if (text.length > 0) {
      delay = deletingDelay;
      nextStep = () => setText(currentWord.slice(0, text.length - 1));
    } else {
      delay = gapDelay;
      nextStep = () => {
        setWordIndex((current) => (current + 1) % words.length);
        setPhase('typing');
      };
    }

    const timer = window.setTimeout(nextStep, delay);
    return () => window.clearTimeout(timer);
  }, [deletingDelay, gapDelay, holdDelay, phase, reduceMotion, text, typingDelay, wordIndex, words]);

  return reduceMotion ? words[0] ?? '' : text;
}
