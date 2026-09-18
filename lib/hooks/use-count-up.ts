import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from its previous value to `target`.
 * Pure CSS can't animate a text node's numeric content, so this is a
 * small rAF-driven hook rather than a new dependency.
 */
export function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const previousTarget = useRef(target);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = previousTarget.current;
    const to = target;
    previousTarget.current = target;

    if (from === to) {
      setValue(to);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, durationMs]);

  return value;
}
