import { useXRefState } from '@myst-theme/providers';
import classNames from 'classnames';

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
}: {
  id?: string;
  kind?: string;
  title?: string;
  hover?: boolean;
  children?: '#' | '¶' | React.ReactNode;
  canSelectText?: boolean;
  className?: string;
  hideInPopup?: boolean;
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
      className={classNames('no-underline text-inherit hover:text-inherit', className, {
        'select-none': !canSelectText,
        'transition-opacity opacity-0 focus:opacity-100 group-hover:opacity-70': hover,
        'hover:underline': !hover,
      })}
      onClick={scroll}
      href={`#${id}`}
      title={title}
      aria-label={title}
    >
      {children}
    </a>
  );
}
