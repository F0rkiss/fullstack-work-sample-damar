import { useEffect, useRef } from 'react';

// Evaluator aid: counts committed renders of one component and writes the
// number straight to the DOM, so showing the counter never causes a render.
export function useRenderCounter() {
  const badge = useRef<HTMLSpanElement>(null);
  const count = useRef(0);
  const rendered = useRef(false);

  // StrictMode re-runs mount effects without rendering again; only an effect
  // that follows a real render may count.
  rendered.current = true;

  useEffect(() => {
    if (!rendered.current) return;
    rendered.current = false;
    count.current += 1;
    if (badge.current) badge.current.textContent = `render ×${count.current}`;
  });

  return badge;
}
