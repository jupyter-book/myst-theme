import { useXRefState } from '@myst-theme/providers';
import classNames from 'classnames';
import { useEffect } from 'react';

export type HashLinkBehavior = {
  /** When scrolling, is this `instant`, `auto` or `scroll`? */
  scrollBehavior?: ScrollBehavior;
  /** When updating the URL, do you push state or replace it? */
  historyState?: 'replace' | 'push' | null;
  /** Change the keyboard tab-index location to the new element */
  focusTarget?: boolean;
};

function openDetails(el: HTMLElement | null) {
  if (!el) return;
  if (el.nodeName === 'DETAILS') {
    (el as HTMLDetailsElement).open = true;
  }
  openDetails(el.parentElement);
}

export function scrollToElement(
  el: HTMLElement | null,
  {
    htmlId = el?.id,
    scrollBehavior = 'smooth',
    historyState = 'replace',
    focusTarget = true,
  }: {
    /** Update the URL fragment to this ID */
    htmlId?: string;
  } & HashLinkBehavior = {},
) {
  if (!el) return;
  openDetails(el);
  el.scrollIntoView({ behavior: scrollBehavior });
  if (historyState === 'push') {
    history.pushState(undefined, '', `#${htmlId}`);
  } else if (historyState === 'replace') {
    history.replaceState(undefined, '', `#${htmlId}`);
  }
  if (focusTarget) {
    // Changes keyboard tab-index location
    if (el.tabIndex === -1) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }
}

const CELL_ID_PREFIX = '#cell-id=';

/**
 * Parse a `#cell-id=<id>` URL fragment into its bare cell id, or `null`.
 *
 * This is the JupyterLab/nbconvert deep-link scheme. The element's `id`
 * attribute stays the *bare* id (HTML-valid, CSS-selectable, parity with the
 * AST and JATS exports); the `cell-id=` prefix is purely a URL convention.
 */
export function parseCellIdFragment(hash: string): string | null {
  if (!hash || !hash.startsWith(CELL_ID_PREFIX)) return null;
  const id = decodeURIComponent(hash.slice(CELL_ID_PREFIX.length));
  return id || null;
}

/**
 * Honor incoming `#cell-id=<id>` deep-links (the JupyterLab/nbconvert scheme).
 *
 * Because the element id is the bare cell id, the browser will not natively
 * auto-scroll a `#cell-id=` fragment — we bridge it here, on initial load and on
 * `hashchange`. Bare `#<id>` links keep working natively. No-ops (never throws)
 * for non-matching fragments or missing elements.
 */
export function useScrollToCellFragment(): void {
  useEffect(() => {
    const scroll = () => {
      const id = parseCellIdFragment(window.location.hash);
      if (!id) return;
      const el = document.getElementById(id); // bare id tolerates any chars
      // historyState: null -> leave the visible `#cell-id=` fragment in place
      scrollToElement(el, { historyState: null });
    };
    scroll(); // initial load (deep-link)
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, []);
}

export function HashLink({
  id,
  kind,
  title = `Link to this ${kind}`,
  children = '¶',
  canSelectText = false,
  hover,
  className = 'font-normal',
  hideInPopup,
  scrollBehavior,
  historyState,
  focusTarget,
  noWidth,
}: {
  id?: string;
  kind?: string;
  title?: string;
  hover?: boolean | 'desktop';
  children?: '#' | '¶' | React.ReactNode;
  canSelectText?: boolean;
  className?: string;
  hideInPopup?: boolean;
  /** Ensures that when centered it doesn't take up space */
  noWidth?: boolean;
} & HashLinkBehavior) {
  const { inCrossRef } = useXRefState();
  if (inCrossRef || !id) {
    // If we are in a cross-reference pop-out, either hide hash link
    // or return something that is **not** a link
    return hideInPopup ? null : (
      <span className={classNames('select-none', className)}>{children}</span>
    );
  }
  const scroll: React.MouseEventHandler<HTMLAnchorElement> = (evt) => {
    evt.preventDefault();
    const el = document.getElementById(id);
    scrollToElement(el, { scrollBehavior, historyState, focusTarget });
  };
  return (
    <a
      className={classNames(
        'no-underline text-inherit hover:text-inherit',
        { 'inline-block w-0 px-0 translate-x-[10px]': noWidth === true },
        className,
        {
          'select-none': !canSelectText,
          'transition-opacity opacity-0 focus:opacity-100 group-hover:opacity-70': hover === true,
          '[@media(hover:hover)]:transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus:opacity-100 [@media(hover:hover)]:group-hover:opacity-70':
            hover === 'desktop',
          'hover:underline': !hover,
        },
      )}
      onClick={scroll}
      href={`#${id}`}
      title={title}
      aria-label={title}
    >
      {children}
    </a>
  );
}
