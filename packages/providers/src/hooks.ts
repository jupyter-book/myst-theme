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
 *
 * ResizeObserver catches container/viewport resizes
 * MutationObserver catches content changes inside, which seems to be
 *   necessary because thebe changes the contents of the output area
 *   after the parent wrapper is loaded, and this doesn't trigger the
 *   ResizeObserver.
 */
export function useIsScrollable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    const resize = new ResizeObserver(check);
    const mutation = new MutationObserver(check);
    resize.observe(el);
    mutation.observe(el, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  return { ref, isScrollable };
}
