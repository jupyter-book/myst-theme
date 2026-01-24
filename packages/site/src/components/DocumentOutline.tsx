import {
  useBaseurl,
  useNavLinkProvider,
  useSiteManifest,
  useThemeTop,
  withBaseurl,
} from '@myst-theme/providers';
import { useNavigation } from '@remix-run/react';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import * as Collapsible from '@radix-ui/react-collapsible';
import { slugToUrl } from 'myst-common';

const SELECTOR = [1, 2, 3, 4].map((n) => `main h${n}`).join(', ');

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
  activeId?: string;
};
/**
 * This renders an item in the table of contents list.
 * scrollIntoView is used to ensure that when a user clicks on an item, it will smoothly scroll.
 */
const Headings = ({ headings, activeId }: Props) => (
  <ul className="myst-outline-list text-sm leading-6 text-slate-400">
    {headings.map((heading) => (
      <li
        key={heading.id}
        className={classNames('myst-outline-item border-l-2 hover:border-l-blue-500', {
          'text-blue-600': heading.id === activeId,
          'border-l-gray-300 dark:border-l-gray-50': heading.id !== activeId,
          'border-l-blue-500': heading.id === activeId,
          'bg-blue-50 dark:bg-slate-800': heading.id === activeId,
          'myst-outline-item-active': heading.id === activeId,
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
            const el = document.querySelector(`#${heading.id}`) as HTMLElement | undefined;
            if (!el) return;

            el.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(undefined, '', `#${heading.id}`);
            // Changes keyboard tab-index location
            if (el.tabIndex === -1) el.tabIndex = -1;
            el.focus({ preventScroll: true });
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

type MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

function useMutationObserver(
  targetRef: RefObject<Element>,
  callback: MutationCallback,
  options: Record<string, any>,
) {
  const [observer, setObserver] = useState<MutationObserver | null>(null);

  if (!onClient) return { observer };

  // Create observer
  useEffect(() => {
    const obs = new MutationObserver(callback);
    setObserver(obs);
  }, [callback, setObserver]);

  // Setup observer
  useEffect(() => {
    if (!observer || !targetRef.current) {
      return;
    }

    try {
      observer.observe(targetRef.current, options);
    } catch (e) {
      console.error(e);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);
}

const useIntersectionObserver = (elements: Element[], options?: Record<string, any>) => {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const [intersecting, setIntersecting] = useState<Element[]>([]);

  if (!onClient) return { observer };
  useEffect(() => {
    // We want a list of all header elements on screen to loop through, but:
    // IntersectionObserver returns elements that have *changed state*, not the full list of elements on screen.
    // So we maintain a set of on-screen elements and add/remove as new intersection events happen.
    const cb: IntersectionObserverCallback = (entries) => {
      setIntersecting((prev) => {
        const next = new Set(prev);
        // Add or remove from our set based on intersection state
        entries.forEach((e) => {
          if (e.isIntersecting) next.add(e.target);
          else next.delete(e.target);
        });
        return Array.from(next);
      });
    };
    const o = new IntersectionObserver(cb, options ?? {});
    setObserver(o);
    return () => o.disconnect();
  }, [options]);

  // Changes to the DOM mean we need to update our intersection observer
  useEffect(() => {
    if (!observer) {
      return;
    }
    // Observe all heading elements
    const toWatch = elements;
    toWatch.forEach((e) => {
      observer.observe(e);
    });
    // Cleanup afterwards
    return () => {
      toWatch.forEach((e) => {
        observer.unobserve(e);
      });
      // Ensure we don't keep stale references when elements are removed/unobserved.
      setIntersecting((prev) => prev.filter((e) => !toWatch.includes(e)));
    };
  }, [elements, observer]);

  return { observer, intersecting };
};

/**
 * Keep track of which headers are visible, and which header is active
 */
export function useHeaders(selector: string, maxdepth: number) {
  const topOffset = useThemeTop();
  if (!onClient) return { activeId: '', headings: [] };
  // Keep track of main manually for now
  const mainElementRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainElementRef.current = document.querySelector('main');
  }, []);

  // Track changes to the DOM
  const [elements, setElements] = useState<HTMLHeadingElement[]>([]);
  const onMutation = useCallback(
    throttle(
      () => {
        setElements(getHeaders(selector));
      },
      500,
      // Trailing updates help ensure we eventually process the last DOM mutation burst.
      { trailing: true },
    ),
    [selector],
  );
  useMutationObserver(mainElementRef, onMutation, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // Trigger initial update
  useEffect(onMutation, []);

  // Watch intersections with headings
  const { intersecting } = useIntersectionObserver(elements);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    // Use the theme's top offset (navbar height) + a bit of padding for filtering active headings to avoid over-shooting the header.
    const OFFSET_PX = topOffset - 10;
    // Prefer a heading marked as highlighted (e.g. focus/anchor) if one is currently intersecting.
    const highlighted = intersecting!.reduce(
      (a, b) => {
        if (a) return a;
        if (b.classList.contains('highlight')) return b.id;
        return null;
      },
      null as string | null,
    );
    const intersectingElements = intersecting as HTMLElement[];
    // Choose the heading closest to the navbar offset line within a viewport window under it.
    // Using a window avoids a case where the active header is off screen the next header is way at the bottom of the screen.
    let bestInActiveHeaderWindow: { el: HTMLElement; distance: number } | undefined;
    const ACTIVE_WINDOW_PX = window.innerHeight * 0.33;
    for (const el of intersectingElements) {
      const distance = el.getBoundingClientRect().top - OFFSET_PX;
      if (
        // Only keep things under the navbar line
        distance >= 0 &&
        // Only keep things over the active window size
        distance <= ACTIVE_WINDOW_PX &&
        // Now if it's closer to the navbar line than the active element, update active
        (!bestInActiveHeaderWindow || distance < bestInActiveHeaderWindow.distance)
      ) {
        bestInActiveHeaderWindow = { el, distance };
      }
    }
    // If nothing is below the navbar line, keep the current active heading.
    const active = bestInActiveHeaderWindow?.el;
    if (highlighted || active) setActiveId(highlighted || active.id);
  }, [intersecting, topOffset]);

  const [headings, setHeadings] = useState<Heading[]>([]);
  useEffect(() => {
    let minLevel = 10;
    const thisHeadings: Heading[] = elements
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

    setHeadings(thisHeadings);
  }, [elements]);

  return { activeId, headings };
}

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

/**
 * Determine whether the margin outline should be occluded by margin elements
 */
function useMarginOccluder() {
  const [occluded, setOccluded] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);
  // Memoize options so `useIntersectionObserver(..., options)` doesn't recreate the observer each render.
  const intersectionOptions = useMemo(() => ({ rootMargin: '0px 0px -33% 0px' }), []);

  // Keep track of main manually for now
  const mainElementRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainElementRef.current = document.querySelector('main');
  }, []);

  // Update list of margin elements
  const onMutation = useCallback(
    throttle(
      () => {
        if (!mainElementRef.current) {
          return;
        }
        // Watch margin elements, or their direct descendents (as some margin elements have height set to zero)
        const classes = [
          'col-margin-right',
          'col-margin-right-inset',
          'col-gutter-outset-right',
          'col-screen-right',
          'col-screen-inset-right',
          'col-page-right',
          'col-page-inset-right',
          'col-body-outset-right',
          'col-gutter-page-right',
          // 'col-screen', // This is on everything!
          'col-page',
          'col-page-inset',
          'col-body-outset',
        ];
        const selector = classes
          .map((cls) => [`.${cls}`, `.${cls} > *`])
          .flat()
          .join(', ');
        const marginElements = mainElementRef.current.querySelectorAll(selector);
        setElements(Array.from(marginElements));
      },
      500,
      // Trailing updates help ensure we eventually process the last DOM mutation burst.
      { trailing: true },
    ),
    [],
  );
  useMutationObserver(mainElementRef, onMutation, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // Trigger initial update
  useEffect(onMutation, []);
  // Keep tabs of margin elements on screen
  const { intersecting } = useIntersectionObserver(elements, intersectionOptions);
  useEffect(() => {
    setOccluded(intersecting!.length > 0);
  }, [intersecting]);

  return { occluded };
}

export const DocumentOutline = ({
  outlineRef,
  title = 'Contents',
  top = 0,
  className,
  selector = SELECTOR,
  children,
  maxdepth = 4,
  isMargin,
}: {
  outlineRef?: React.RefObject<HTMLElement>;
  title?: React.ReactNode;
  top?: number;
  height?: number;
  className?: string;
  selector?: string;
  children?: React.ReactNode;
  maxdepth?: number;
  isMargin?: boolean;
}) => {
  const { activeId, headings } = useHeaders(selector, maxdepth);
  const [open, setOpen] = useState(false);

  // Keep track of changing occlusion
  const { occluded } = useMarginOccluder();

  // Handle transition between margin and non-margin
  useEffect(() => {
    setOpen(true);
  }, [isMargin]);

  // Handle occlusion when outline is in margin
  useEffect(() => {
    if (isMargin) {
      setOpen(!occluded);
    }
  }, [occluded, isMargin]);

  if (headings.length <= 1 || !onClient) {
    return <nav suppressHydrationWarning>{children}</nav>;
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="myst-outline-section">
      <nav
        ref={outlineRef}
        aria-label="Document Outline"
        className={classNames(
          'myst-outline not-prose overflow-y-auto',
          'transition-opacity duration-700', // Animation on load
          className,
        )}
        style={{
          top: top,
          maxHeight: `calc(100vh - ${top + 100}px)`,
        }}
      >
        <div className="myst-outline-header flex flex-row gap-2 mb-4 text-sm leading-6 uppercase rounded-lg text-slate-900 dark:text-slate-100">
          {title}
          <Collapsible.Trigger asChild>
            <button
              className="myst-outline-collapsible self-center flex-none rounded-md group hover:bg-slate-300/30 focus:outline outline-blue-200 outline-2"
              aria-label="Open Contents"
            >
              <ChevronRightIcon
                className="transition-transform duration-300 group-data-[state=open]:rotate-90 text-text-slate-700 dark:text-slate-100"
                height="1.5rem"
                width="1.5rem"
              />
            </button>
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content className="CollapsibleContent">
          <Headings headings={headings} activeId={activeId} />
          {children}
        </Collapsible.Content>
      </nav>
    </Collapsible.Root>
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
      <div className="myst-supporting-documents my-4 text-sm leading-6 uppercase text-slate-900 dark:text-slate-100">
        Supporting Documents
      </div>
      <ul className="flex flex-col gap-2 pl-0 text-sm leading-6 list-none text-slate-700 dark:text-slate-300">
        {pages
          .filter((p) => 'slug' in p)
          .map((p) => {
            return (
              <li key={p.slug}>
                <NavLink
                  to={withBaseurl(`/${slugToUrl(p.slug)}#main`, baseurl)}
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
