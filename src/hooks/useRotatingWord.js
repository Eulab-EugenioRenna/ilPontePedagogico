import { useEffect, useState } from 'react';

export function useRotatingWord(words, delay = 2100) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, delay);
    return () => window.clearInterval(timer);
  }, [words.length, delay]);

  return words[index];
}
