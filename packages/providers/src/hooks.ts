import { useEffect, useRef, useState } from 'react';

// Based on https://usehooks-ts.com/react-hook/use-media-query
export function useMediaQuery(query: string): boolean {
  const ssr = typeof document === 'undefined';
  const getMatches = (match: string): boolean => {
    if (ssr) return false;
    return window.matchMedia(match).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    if (ssr) return;
    const matchMedia = window.matchMedia(query);
    // Triggered at the first client-side load and if query changes
    handleChange();
    // Listen matchMedia
    matchMedia.addEventListener('change', handleChange);
    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Returns a ref and a boolean indicating whether the element has horizontal overflow.
 * We use this to make scrollable regions keyboard-accessible if they are wide.
 */
export function useIsScrollable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setIsScrollable(el.scrollWidth > el.clientWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isScrollable };
}

/**
 * Adds tabIndex/role/aria-label to each `.jp-OutputArea-output` descendant
 * that overflows horizontally, so wide cell outputs are keyboard-accessible.
 *
 * Re-checks fire on:
 * - mount (requestAnimationFrame, after children have laid out)
 * - parent layout changes (ResizeObserver), which also fires when child
 *   content mounts or loads (e.g. images, plotly).
 */
export function useScrollableOutputs<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stamp = () => {
      el.querySelectorAll<HTMLElement>('.jp-OutputArea-output').forEach((child) => {
        if (child.scrollWidth > child.clientWidth) {
          child.tabIndex = 0;
          child.setAttribute('role', 'region');
          child.setAttribute('aria-label', 'cell output');
        } else {
          child.removeAttribute('tabindex');
          child.removeAttribute('role');
          child.removeAttribute('aria-label');
        }
      });
    };
    const raf = requestAnimationFrame(stamp);
    const resize = new ResizeObserver(stamp);
    resize.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
    };
  }, []);

  return { ref };
}
