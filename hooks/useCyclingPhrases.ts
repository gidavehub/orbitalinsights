// FILE: hooks/useCyclingPhrases.ts
import { useState, useEffect } from 'react';

export const useCyclingPhrases = (phrases: string[], interval: number): string => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [phrases, interval]);

  return phrases[phraseIndex];
}; 