import { useEffect, useState } from 'react';

function savedSpeed() {
  try {
    const v = Number(localStorage.getItem('algorix:velocidade'));
    return [0.5, 1, 2, 4].includes(v) ? v : 1;
  } catch {
    return 1;
  }
}
/** Remount the consumer by timeline identity when the input/algorithm changes. */
export function usePlayback(length: number) {
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(savedSpeed);
  const last = Math.max(0, length - 1);
  useEffect(() => {
    try {
      localStorage.setItem('algorix:velocidade', String(speed));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [speed]);
  useEffect(() => {
    if (!playing || index >= last) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, last));
      if (index + 1 >= last) setPlaying(false);
    }, 650 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, last, speed]);
  const seek = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, next)));
  };
  return {
    index,
    last,
    speed,
    setSpeed,
    playing,
    seek,
    toggle: () => {
      if (last === 0) return;
      if (index >= last) setIndex(0);
      setPlaying((p) => !p);
    },
    reset: () => seek(0),
    next: () => seek(index + 1),
    previous: () => seek(index - 1),
  };
}
export type Playback = ReturnType<typeof usePlayback>;
