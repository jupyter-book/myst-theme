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
 * Used to make scrollable regions keyboard-accessible when they are wide.
 * We use two events to detect overflow:
 *
 * - ResizeObserver catches container/viewport resizes on initial load
 * - requestAnimationFrame re-checks for content that lands after the parent
 *   wrapper mounts, which is what happens when Thebe loads MIME bundle output.
 */
export function useIsScrollable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    const raf = requestAnimationFrame(check);
    const resize = new ResizeObserver(check);
    resize.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
    };
  }, []);

  return { ref, isScrollable };
}

/**
 * Stamps tabIndex/role/aria-label onto descendant elements that have
 * horizontal overflow, so each scrollable output is keyboard-accessible.
 * Used for cell outputs where Thebe owns the per-output DOM and only needs
 * a11y attributes added on top of its existing overflow styles.
 */
export function useScrollableOutputs<T extends HTMLElement>(
  selector = '.jp-OutputArea-output',
  label = 'cell output',
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stamp = () => {
      el.querySelectorAll<HTMLElement>(selector).forEach((child) => {
        if (child.scrollWidth > child.clientWidth) {
          child.tabIndex = 0;
          child.setAttribute('role', 'region');
          child.setAttribute('aria-label', label);
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
  }, [selector, label]);

  return { ref };
}
