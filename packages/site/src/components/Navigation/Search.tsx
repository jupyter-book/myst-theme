import {
  createElement,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
} from 'react';
import type { KeyboardEventHandler, Dispatch, SetStateAction, FormEvent, MouseEvent } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  ArrowTurnDownLeftIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  Bars3BottomLeftIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { DocumentIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { RankedSearchResult, HeadingLevel, MystSearchIndex } from '@myst-theme/search';
import { SPACE_OR_PUNCTUATION, rankResults } from '@myst-theme/search';
import {
  useThemeTop,
  useSearchFactory,
  useLinkProvider,
  withBaseurl,
  useBaseurl,
  useNavigateProvider,
} from '@myst-theme/providers';

/**
 * Shim for string.matchAll
 *
 * @param text - text to repeatedly match with pattern
 * @param pattern - global pattern
 */
function matchAll(text: string, pattern: RegExp) {
  const matches = [];
  let match;
  while ((match = pattern.exec(text))) {
    matches.push(match);
  }
  return matches;
}

/**
 * Highlight a text string with an array of match words
 *
 * @param text - text to highlight
 * @param matches - regular expression patterns to match against
 * @param limit - limit to the number of characters after first match
 * @param classname - CSS classname to use
 */
function MarkedText({
  text,
  matches,
  limit,
  className,
}: {
  text: string;
  matches: string[];
  limit?: number;
  className?: string;
}) {
  // Split by delimeter, but _keep_ delimeter!
  const splits = matchAll(text, SPACE_OR_PUNCTUATION);
  const tokens: string[] = [];
  let start = 0;
  for (const splitMatch of splits) {
    tokens.push(text.slice(start, splitMatch.index));
    tokens.push(splitMatch[0]);
    start = splitMatch.index + splitMatch[0].length;
  }
  tokens.push(text.slice(start));

  // Build RegExp matching all highlight matches
  const allTerms = matches.join('|');
  const pattern = new RegExp(`^(${allTerms})`, 'i'); // Match prefix and total pattern, case-insensitively
  const renderToken = (token: string) =>
    pattern.test(token) ? (
      <>
        <mark className="text-blue-600 bg-inherit dark:text-blue-400 group-aria-selected:text-white group-aria-selected:underline">
          {token}
        </mark>
      </>
    ) : (
      token
    );
  let firstIndex: number;
  let lastIndex: number;
  const hasLimit = limit !== undefined;

  if (!hasLimit) {
    firstIndex = 0;
    lastIndex = tokens.length;
  } else {
    firstIndex = tokens.findIndex((token) => pattern.test(token));
    let numChars = 0;
    for (
      lastIndex = firstIndex + 1;
      lastIndex < tokens.length - 1 && numChars + tokens[lastIndex].length <= limit;
      lastIndex++
    ) {
      numChars += tokens[lastIndex].length;
    }
  }

  if (tokens.length === 0) {
    return <span className={className}>{...tokens}</span>;
  } else {
    const firstRenderer = renderToken(tokens[firstIndex]);
    const remainingTokens = tokens.slice(firstIndex + 1, lastIndex);
    const remainingRenderers = remainingTokens.map((token) => renderToken(token));

    return (
      <span
        className={classNames(
          className,
          {
            "before:content-['..._']": hasLimit,
            "after:content-['_...']": hasLimit,
          },
          'truncate',
          'w-full',
        )}
      >
        {firstRenderer}
        {...remainingRenderers}
      </span>
    );
  }
}

/**
 * Return true if the client is a Mac, false if not, or undefined if running on the server
 */
function isMac(): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  } else {
    const hostIsMac = /mac/i.test(
      (window.navigator as any).userAgentData?.platform ?? window.navigator.userAgent,
    );
    return hostIsMac;
  }
}

// Blocking code to ensure that the pre-hydration state on the client matches the post-hydration state
// The server with SSR cannot determine the client platform
const clientThemeCode = `
;(() => {
const script = document.currentScript;
const root = script.parentElement;

const isMac = /mac/i.test(
      window.navigator.userAgentData?.platform ?? window.navigator.userAgent,
    );
root.querySelectorAll(".hide-mac").forEach(node => {node.classList.add(isMac ? "hidden" : "block")});
root.querySelectorAll(".show-mac").forEach(node => {node.classList.add(!isMac ? "hidden" : "block")});
})()`;

function BlockingPlatformLoader() {
  return <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />;
}

/**
 * Component that represents the keyboard shortcut for launching search
 */
function SearchShortcut() {
  const hostIsMac = isMac();
  return (
    <div
      aria-hidden
      className="items-center hidden mx-1 font-mono text-sm text-gray-400 sm:flex gap-x-1"
    >
      <kbd
        className={classNames(
          'px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md',
          'shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-none',
          'hide-mac',
          { hidden: hostIsMac === true },
          { block: hostIsMac === false },
        )}
      >
        CTRL
      </kbd>
      <kbd
        className={classNames(
          'px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md',
          'shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-none',
          'show-mac',
          { hidden: hostIsMac === false },
          { block: hostIsMac === true },
        )}
      >
        ⌘
      </kbd>
      <kbd className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-none ">
        K
      </kbd>
      <BlockingPlatformLoader />
    </div>
  );
}

/**
 * Renderer for a single search result
 */
function SearchResultItem({
  result,
  closeSearch,
}: {
  result: RankedSearchResult;
  closeSearch?: () => void;
}) {
  const { hierarchy, type, url, queries } = result;
  const baseurl = useBaseurl();
  const Link = useLinkProvider();

  // Render the icon
  const iconProps = useMemo(() => {
    return { className: 'inline-block w-6 mx-2 shrink-0' };
  }, []);
  const iconRenderer = createElement(
    type === 'lvl1' ? DocumentIcon : type === 'content' ? Bars3BottomLeftIcon : HashtagIcon,
    iconProps,
  );

  // Generic "this document matched"
  const title = result.type === 'content' ? result['content'] : hierarchy[type as HeadingLevel]!;
  const matches = useMemo(() => queries.flatMap((query) => Object.keys(query.matches)), [queries]);

  // Render the title, i.e. content or heading
  const titleRenderer = (
    <MarkedText
      text={title}
      matches={matches}
      limit={type === 'content' ? 64 : undefined}
      className="text-sm"
    />
  );

  // Render the subtitle i.e. file name
  let subtitleRenderer;
  if (result.type === 'lvl1') {
    subtitleRenderer = undefined;
  } else {
    const subtitle = result.hierarchy.lvl1!;
    subtitleRenderer = <MarkedText text={subtitle} matches={matches} className="text-xs" />;
  }

  const enterIconRenderer = (
    <ArrowTurnDownLeftIcon className="invisible w-6 mx-2 group-aria-selected:visible" />
  );

  return (
    <Link
      className="block px-1 py-2 text-gray-700 rounded shadow-md dark:text-white group-aria-selected:bg-blue-600 group-aria-selected:text-white dark:shadow-none dark:bg-stone-800"
      to={withBaseurl(url, baseurl)}
      // Close the main search on click
      onClick={closeSearch}
    >
      <div className="flex flex-row h-11">
        {iconRenderer}
        <div className="flex flex-col justify-center grow">
          {titleRenderer}
          {subtitleRenderer}
        </div>
        {enterIconRenderer}
      </div>
    </Link>
  );
}

interface SearchResultsProps {
  searchResults: RankedSearchResult[];
  searchListID: string;
  searchLabelID: string;
  selectedIndex: number;
  onHoverSelect: (index: number) => void;
  className?: string;
  closeSearch?: () => void;
}

function SearchResults({
  searchResults,
  searchListID,
  searchLabelID,
  className,
  selectedIndex,
  onHoverSelect,
  closeSearch,
}: SearchResultsProps) {
  // Array of search item refs
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Ref to assign items
  const setItemRef = useCallback(
    (elem: HTMLLIElement) => {
      if (!elem) {
        return;
      }
      const index = parseInt(elem.dataset.index!);
      itemsRef.current[index] = elem;
    },
    [itemsRef],
  );

  // Keep activeDescendent in sync wth selected index
  const activeDescendent = useMemo(() => {
    const item = itemsRef.current[selectedIndex];
    if (!item) {
      return '';
    } else {
      return item.id;
    }
  }, [selectedIndex, itemsRef]);

  // If the select item changes, bring it into view
  useEffect(() => {
    const item = itemsRef.current[selectedIndex];
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle mouse movement events that set the current hovered element
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLLIElement>) => {
      const index = parseInt((event.currentTarget as HTMLLIElement).dataset.index!);
      onHoverSelect(index);
    },
    [onHoverSelect],
  );
  return (
    <div className="mt-4 overflow-y-scroll">
      {searchResults.length ? (
        <ul
          // Accessiblity:
          // indicate that this is a selectbox
          role="listbox"
          id={searchListID}
          aria-label="Search results"
          aria-labelledby={searchLabelID}
          aria-orientation="vertical"
          // Track focused item
          aria-activedescendant={activeDescendent}
          className={classNames('flex flex-col gap-y-2 px-1', className)}
        >
          {searchResults.map((result, index) => (
            <li
              key={result.id}
              ref={setItemRef}
              data-index={index}
              // Accessiblity:
              //   Indicate that this is an option
              role="option"
              //   Indicate whether this is selected
              aria-selected={selectedIndex === index}
              // Allow for nested-highlighting
              className="group"
              // Trigger selection on movement, so that scrolling doesn't trigger handler
              onMouseMove={handleMouseMove}
            >
              <SearchResultItem result={result} closeSearch={closeSearch} />
            </li>
          ))}
        </ul>
      ) : (
        <span>No results found.</span>
      )}
    </div>
  );
}

/**
 * Build search implementation by requesting search index from server
 */
function useSearch() {
  const baseURL = useBaseurl();
  const fetcher = useFetcher();
  const [enabled, setEnabled] = useState(true);
  // Load index when this component is required
  // TODO: this reloads every time the search box is opened.
  //       we should lift the state up
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data == null) {
      const searchURL = withBaseurl('/myst.search.json', baseURL);
      fetcher.load(searchURL);
    }
  }, [fetcher, baseURL]);

  const searchFactory = useSearchFactory();
  const search = useMemo(() => {
    if (!fetcher.data || !searchFactory) {
      return undefined;
    } else {
      if (fetcher.data?.version && fetcher.data?.records) {
        return searchFactory(fetcher.data as MystSearchIndex);
      }
      setEnabled(false);
      return undefined;
    }
  }, [searchFactory, fetcher.data, setEnabled]);

  // Implement pass-through
  return { search, enabled };
}

interface SearchFormProps {
  debounceTime: number;
  searchResults: RankedSearchResult[] | undefined;
  setSearchResults: Dispatch<SetStateAction<RankedSearchResult[] | undefined>>;
  searchInputID: string;
  searchListID: string;
  searchLabelID: string;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  closeSearch?: () => void;
}

function SearchForm({
  debounceTime,
  searchResults,
  setSearchResults,
  searchInputID,
  searchListID,
  searchLabelID,
  selectedIndex,
  setSelectedIndex,
  closeSearch,
}: SearchFormProps) {
  const [query, setQuery] = useState<string>('');
  const { search: doSearch, enabled } = useSearch();

  // Debounce user input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query != undefined && !!doSearch) {
        doSearch(query).then((rawResults) => {
          setSearchResults(
            rawResults &&
              rankResults(rawResults)
                // Filter duplicates by URL
                .filter((result, index, array) => result.url !== array[index - 1]?.url),
          );
        });
      }
    }, debounceTime);
    return () => clearTimeout(timeoutId);
  }, [doSearch, query, debounceTime]);
  // Handle user input
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);
  // Handle item selection
  const navigate = useNavigateProvider();
  const baseurl = useBaseurl();

  // Handle item selection and navigation
  const handleSearchKeyPress = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      // Ignore modifiers
      if (event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (!searchResults) {
        return;
      }

      // Item selection
      if (event.key === 'Enter') {
        event.preventDefault();

        const url = searchResults[selectedIndex]?.url;
        if (url) {
          navigate(withBaseurl(url, baseurl));
          closeSearch?.();
        }
      }
      // Item navigation
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();

        if (event.key === 'ArrowUp') {
          setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : 0);
        } else {
          setSelectedIndex(
            selectedIndex < searchResults.length - 1 ? selectedIndex + 1 : searchResults.length - 1,
          );
        }
      }
    },
    [searchResults, selectedIndex],
  ); // Our form doesn't use the submit function
  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="relative flex w-full h-10 flow-row gap-x-1 ">
          <label id={searchListID} htmlFor={searchInputID}>
            <MagnifyingGlassIcon className="absolute text-gray-400 inset-y-0 start-0 h-10 w-10 p-2.5 aspect-square flex items-center pointer-events-none" />
          </label>
          <input
            autoComplete="off"
            spellCheck="false"
            disabled={!enabled}
            autoCapitalize="false"
            className={classNames(
              'block flex-grow p-2 ps-10 placeholder-gray-400',
              'border border-gray-300 dark:border-gray-600',
              'rounded-lg bg-gray-50 dark:bg-gray-700',
              'focus:ring-blue-500 dark:focus:ring-blue-500',
              'focus:border-blue-500 dark:focus:border-blue-500',
              'dark:placeholder-gray-400',
              { 'border-red-500': !enabled },
            )}
            id={searchInputID}
            aria-labelledby={searchLabelID}
            aria-controls={searchListID}
            placeholder="Search"
            type="search"
            required
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyPress}
          />
          <Dialog.Close asChild className="block grow-0 sm:hidden">
            <button aria-label="Close">
              <XCircleIcon className="flex items-center w-10 h-10 aspect-square" />
            </button>
          </Dialog.Close>
        </div>
      </form>
      {!enabled && (
        <div className="mx-2 mt-4 text-sm text-gray-500">
          Search is not enabled for this site. :(
        </div>
      )}
    </>
  );
}

interface SearchPlaceholderButtonProps {
  className?: string;
  disabled?: boolean;
}
const SearchPlaceholderButton = forwardRef<
  HTMLButtonElement,
  SearchPlaceholderButtonProps & Dialog.DialogTriggerProps
>(({ className, disabled, ...props }, ref) => {
  return (
    <button
      {...props}
      className={classNames(
        className,
        'flex items-center h-10 aspect-square sm:w-64 text-left text-gray-400',
        'border border-gray-300 dark:border-gray-600',
        'rounded-lg bg-gray-50 dark:bg-gray-700',
        {
          'hover:ring-blue-500': !disabled,
          'dark:hover:ring-blue-500': !disabled,
          'hover:border-blue-500': !disabled,
          'dark:hover:border-blue-500': !disabled,
        },
      )}
      disabled={!!disabled}
      ref={ref}
    >
      <MagnifyingGlassIcon className="p-2.5 h-10 w-10 aspect-square" />
      <span className="hidden sm:block grow">Search</span>
      <SearchShortcut />
    </button>
  );
});

export interface SearchProps {
  debounceTime?: number;
}
/**
 * Component that implements a basic search interface
 */
export function Search({ debounceTime = 500 }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<RankedSearchResult[] | undefined>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const top = useThemeTop();

  // Clear search state on close
  useEffect(() => {
    if (!open) {
      setSearchResults(undefined);
      setSelectedIndex(0);
    }
  }, [open]);

  // Trigger modal on keypress
  const handleDocumentKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' && (isMac() ? event.metaKey : event.ctrlKey)) {
      setOpen(true);
      event.preventDefault();
    }
  }, []);

  // Mount the document event handlers
  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleDocumentKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyPress);
    };
  }, [handleDocumentKeyPress]);

  const triggerClose = useCallback(() => setOpen(false), [setOpen]);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <SearchPlaceholderButton />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#656c85cc] z-[1000]" />
        <Dialog.Content
          className="fixed flex flex-col top-0 bg-white dark:bg-stone-900 z-[1001] h-screen w-screen sm:left-1/2 sm:-translate-x-1/2 sm:w-[90vw] sm:max-w-screen-sm sm:h-auto sm:max-h-[var(--content-max-height)] sm:top-[var(--content-top)] sm:rounded-md p-4 text-gray-900 dark:text-white"
          // Store state as CSS variables so that we can set the style with tailwind variants
          style={
            {
              '--content-top': `${top}px`,
              '--content-max-height': `calc(90vh - var(--content-top))`,
            } as React.CSSProperties
          }
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Search Website</Dialog.Title>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <Dialog.Description>
              Search articles and their contents using fuzzy-search and prefix-matching
            </Dialog.Description>
          </VisuallyHidden.Root>
          <SearchForm
            searchListID="search-list"
            searchLabelID="search-label"
            searchInputID="search-input"
            debounceTime={debounceTime}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            closeSearch={triggerClose}
          />
          {searchResults && (
            <SearchResults
              searchListID="search-list"
              searchLabelID="search-label"
              className="mt-4"
              searchResults={searchResults}
              selectedIndex={selectedIndex}
              onHoverSelect={setSelectedIndex}
              closeSearch={triggerClose}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
