import {
  useBaseurl,
  useNavLinkProvider,
  useSiteManifest,
  withBaseurl,
} from '@myst-theme/providers';
import { useNavigation } from '@remix-run/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

const SELECTOR = [1, 2, 3, 4].map((n) => `main h${n}`).join(', ');
const HIGHLIGHT_CLASS = 'highlight';

const onClient = typeof document !== 'undefined';

export type Heading = {
  element: HTMLHeadingElement;
  id: string;
  title: string;
  titleHTML: string;
  level: number;
};

type Props = {
  headings: Heading[];
  selector: string;
  activeId?: string;
  highlight?: () => void;
};
/**
 * This renders an item in the table of contents list.
 * scrollIntoView is used to ensure that when a user clicks on an item, it will smoothly scroll.
 */
const Headings = ({ headings, activeId, highlight, selector }: Props) => (
  <ul className="text-sm leading-6 text-slate-400">
    {headings.map((heading) => (
      <li
        key={heading.id}
        className={classNames('border-l-2 hover:border-l-blue-500', {
          'text-blue-600': heading.id === activeId,
          'border-l-gray-300 dark:border-l-gray-50': heading.id !== activeId,
          'border-l-blue-500': heading.id === activeId,
          'bg-blue-50 dark:bg-slate-800': heading.id === activeId,
        })}
      >
        <a
          className={classNames('block p-1', {
            'text-slate-900 dark:text-slate-50': heading.level < 2 && heading.id !== activeId,
            'text-slate-500 dark:text-slate-300': heading.level >= 2 && heading.id !== activeId,
            'text-blue-600 dark:text-white font-bold': heading.id === activeId,
            'pr-2': heading.id !== activeId, // Allows for bold to change length
            'pl-2': heading.level === 1,
            'pl-4': heading.level === 2,
            'pl-8 text-xs': heading.level === 3,
            'pl-10 text-xs font-light': heading.level === 4,
            'pl-12 text-xs font-extralight': heading.level === 5,
          })}
          href={`#${heading.id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.querySelector(`#${heading.id}`);
            if (!el) return;
            getHeaders(selector).forEach((h) => {
              h.classList.remove(HIGHLIGHT_CLASS);
            });
            el.classList.add(HIGHLIGHT_CLASS);
            highlight?.();
            el.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(undefined, '', `#${heading.id}`);
          }}
          // Note that the title can have math in it!
          dangerouslySetInnerHTML={{ __html: heading.titleHTML }}
        />
      </li>
    ))}
  </ul>
);

function cloneHeadingElement(originalElement: HTMLSpanElement) {
  // Clone the original element
  const clonedElement = originalElement.cloneNode(true) as HTMLSpanElement;

  // Get all <abbr> elements in the cloned element
  const abbrElements = clonedElement.getElementsByTagName('abbr');

  // Move children of <abbr> elements to their parent
  for (let i = 0; i < abbrElements.length; i++) {
    const abbr = abbrElements[i];
    const parent = abbr.parentNode as HTMLSpanElement;
    while (abbr.firstChild) {
      parent.insertBefore(abbr.firstChild, abbr);
    }
    parent.removeChild(abbr);
  }
  return clonedElement;
}

function getHeaders(selector: string): HTMLHeadingElement[] {
  const headers = Array.from(document.querySelectorAll(selector)).filter((e) => {
    const parent = e.closest('.exclude-from-outline');
    return !(e.classList.contains('title') || parent);
  });
  return headers as HTMLHeadingElement[];
}

export function useHeaders(selector: string, maxdepth: number) {
  if (!onClient) return { activeId: '', headings: [] };
  const onScreen = useRef<Set<HTMLHeadingElement>>(new Set());
  const [activeId, setActiveId] = useState<string>();
  const headingsSet = useRef<Set<HTMLHeadingElement>>(new Set());

  const highlight = useCallback(() => {
    const current = [...onScreen.current];
    const highlighted = current.reduce(
      (a, b) => {
        if (a) return a;
        if (b.classList.contains('highlight')) return b.id;
        return null;
      },
      null as string | null,
    );
    const active = [...onScreen.current].sort((a, b) => a.offsetTop - b.offsetTop)[0];
    if (highlighted || active) setActiveId(highlighted || active.id);
  }, []);

  const { observer } = useIntersectionObserver(highlight, onScreen.current);
  const [elements, setElements] = useState<HTMLHeadingElement[]>([]);

  const render = throttle(() => setElements(getHeaders(selector)), 500);
  useEffect(() => {
    // We have to look at the document changes for reloads/mutations
    const main = document.querySelector('main');
    const mutations = new MutationObserver(render);
    // Fire when added to the dom
    render();
    if (main) {
      mutations.observe(main, { attributes: true, childList: true, subtree: true });
    }
    return () => mutations.disconnect();
  }, []);

  useEffect(() => {
    // Re-observe all elements when the observer changes
    Array.from(elements).map((e) => observer.current?.observe(e));
  }, [observer]);

  let minLevel = 10;
  const headings: Heading[] = elements
    .map((element) => {
      return {
        element,
        level: Number(element.tagName.slice(1)),
        id: element.id,
        text: element.querySelector('.heading-text'),
      };
    })
    .filter((h) => !!h.text)
    .map(({ element, level, text, id }) => {
      const { innerText: title, innerHTML: titleHTML } = cloneHeadingElement(
        text as HTMLSpanElement,
      );
      minLevel = Math.min(minLevel, level);
      return { element, title, titleHTML, id, level };
    })
    .filter((heading) => {
      heading.level = heading.level - minLevel + 1;
      return heading.level < maxdepth + 1;
    });

  headings.forEach(({ element: e }) => {
    if (headingsSet.current.has(e)) return;
    observer.current?.observe(e);
    headingsSet.current.add(e);
  });

  return { activeId, highlight, headings };
}

const useIntersectionObserver = (highlight: () => void, onScreen: Set<HTMLHeadingElement>) => {
  const observer = useRef<IntersectionObserver | null>(null);
  if (!onClient) return { observer };
  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        onScreen[entry.isIntersecting ? 'add' : 'delete'](entry.target as HTMLHeadingElement);
      });
      highlight();
    };
    const o = new IntersectionObserver(callback);
    observer.current = o;
    return () => o.disconnect();
  }, [highlight, onScreen]);
  return { observer };
};

export function useOutlineHeight<T extends HTMLElement = HTMLElement>(
  existingContainer?: React.RefObject<T>,
) {
  const container = useRef<T>(null);
  const outline = useRef<T>(null);
  const transitionState = useNavigation().state;
  const setHeight = () => {
    if (!container.current || !outline.current) return;
    const height = container.current.offsetHeight - window.scrollY + container.current.offsetTop;
    outline.current.style.display = height < 50 ? 'none' : '';
    outline.current.style.height = height > window.innerHeight ? '' : `${height}px`;
    outline.current.style.opacity = height && height > 300 ? '' : '0';
    outline.current.style.pointerEvents = height && height > 300 ? '' : 'none';
  };
  useEffect(() => {
    setHeight();
    setTimeout(setHeight, 100); // Some lag sometimes
    const handleScroll = () => setHeight();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [container.current, outline.current, transitionState]);

  useEffect(() => {
    if (!existingContainer || !existingContainer.current) return;
    (container as any).current = existingContainer.current;
  }, [existingContainer?.current]);
  return { container, outline };
}

export const DocumentOutline = ({
  outlineRef,
  top = 0,
  className,
  selector = SELECTOR,
  children,
  maxdepth = 4,
}: {
  outlineRef?: React.RefObject<HTMLElement>;
  top?: number;
  height?: number;
  className?: string;
  selector?: string;
  children?: React.ReactNode;
  maxdepth?: number;
}) => {
  const { activeId, headings, highlight } = useHeaders(selector, maxdepth);
  if (headings.length <= 1 || !onClient) {
    return <nav suppressHydrationWarning>{children}</nav>;
  }
  return (
    <nav
      ref={outlineRef}
      aria-label="Document Outline"
      className={classNames(
        'not-prose overflow-y-auto',
        'transition-opacity duration-700', // Animation on load
        className,
      )}
      style={{
        top: top,
        maxHeight: `calc(100vh - ${top + 20}px)`,
      }}
    >
      <div className="mb-4 text-sm leading-6 uppercase text-slate-900 dark:text-slate-100">
        In this article
      </div>
      <Headings headings={headings} activeId={activeId} highlight={highlight} selector={selector} />
      {children}
    </nav>
  );
};

export function SupportingDocuments() {
  const { projects } = useSiteManifest() ?? {};
  const NavLink = useNavLinkProvider();
  const baseurl = useBaseurl();
  const pages = projects?.[0]?.pages;
  if (!pages || pages.length === 0) return null;
  return (
    <>
      <div className="my-4 text-sm leading-6 uppercase text-slate-900 dark:text-slate-100">
        Supporting Documents
      </div>
      <ul className="flex flex-col gap-2 pl-0 text-sm leading-6 list-none text-slate-700 dark:text-slate-300">
        {pages
          .filter((p) => 'slug' in p)
          .map((p) => {
            return (
              <li key={p.slug}>
                <NavLink
                  to={withBaseurl(`/${p.slug}#main`, baseurl)}
                  prefetch="intent"
                  className={({ isActive }) =>
                    classNames('no-underline flex self-center hover:text-blue-700', {
                      'text-blue-600': isActive,
                    })
                  }
                >
                  <DocumentChartBarIcon
                    width="1.25rem"
                    height="1.25rem"
                    className="inline mr-2 shrink-0"
                  />
                  <span>{p.short_title || p.title}</span>
                </NavLink>
              </li>
            );
          })}
      </ul>
    </>
  );
}
