import { useEffect, useState, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  HashtagIcon,
  PencilIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ISearch, RankedSearchResult, HeadingLevel } from '@myst-theme/search';
import { SPACE_OR_PUNCTUATION, rankAndFilterResults } from '@myst-theme/search';
import { withBaseurl, useBaseurl, useThemeTop } from '@myst-theme/providers';

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
 * @param result - search result to use for highlighting
 * @param limit - limit to the number of tokens after first match
 */
function MarkedText({ text, matches, limit }: { text: string; matches: string[]; limit?: number }) {
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
        <mark>{token}</mark>
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
    lastIndex = firstIndex + limit;
  }

  if (tokens.length === 0) {
    return <>{...tokens}</>;
  } else {
    const firstRenderer = <mark>{tokens[firstIndex]}</mark>;
    const remainingTokens = tokens.slice(firstIndex + 1, lastIndex);
    const remainingRenderers = remainingTokens.map((token) => renderToken(token));

    return (
      <>
        {hasLimit && '... '}
        {firstRenderer}
        {...remainingRenderers}
        {hasLimit && ' ...'}
      </>
    );
  }
}

/**
 * Renderer for a single search result
 */
function SearchItem({ result }: { result: RankedSearchResult }) {
  const { hierarchy, type, url, queries } = result;
  const baseURL = useBaseurl();

  // Render the icon
  const iconRenderer =
    type === 'lvl1' ? (
      <DocumentTextIcon className="w-6 inline-block mx-2 text-gray-400" />
    ) : type === 'content' ? (
      <PencilIcon className="w-6 inline-block mx-2 text-gray-400" />
    ) : (
      <HashtagIcon className="w-6 inline-block mx-2 text-gray-400" />
    );

  // Generic "this document matched"
  const title = result.type === 'content' ? result['content'] : hierarchy[type as HeadingLevel]!;
  const matches = queries.flatMap((query) => Object.keys(query.matches));

  const titleRenderer = (
    <MarkedText text={title} matches={matches} limit={type === 'content' ? 16 : undefined} />
  );

  let subtitleRenderer;
  if (result.type === 'lvl1') {
    subtitleRenderer = undefined;
  } else {
    const subtitle = result.hierarchy.lvl1!;
    subtitleRenderer = <MarkedText text={subtitle} matches={matches} />;
  }

  return (
    <a href={withBaseurl(url, baseURL)}>
      <div className="flex flex-row">
        {iconRenderer}
        <div className="flex flex-col">
          <span className="text-sm">{titleRenderer}</span>
          {subtitleRenderer && <span className="text-xs text-gray-400">{subtitleRenderer}</span>}
        </div>
      </div>
    </a>
  );
}

/**
 * Component that implements a basic search interface
 */
export function Search({ className, doSearch }: { className?: string; doSearch: ISearch }) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<RankedSearchResult[]>([]);
  const [query, setQuery] = useState<string>();
  const top = useThemeTop();

  // Debounce user input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query != undefined) {
        const rawResults = doSearch(query);
        const rankedResults = rankAndFilterResults(rawResults);
        setSearchResults(rankedResults);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [doSearch, query]);

  // Handle user input
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  // Trigger modal on keypress
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' && event.ctrlKey) {
      setOpen(true);
      event.preventDefault();
    }
  }, []);

  // Mount the document event handlers
  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={classNames(
            className,
            'flex items-center h-10 aspect-square sm:w-64 border border-gray-300 rounded-lg bg-gray-50 hover:ring-blue-500 hover:border-blue-500 dark:bg-gray-700 dark:border-gray-600 text-left dark:hover:ring-blue-500 dark:hover:border-blue-500',
          )}
        >
          <MagnifyingGlassIcon className="p-2.5 h-10 w-10 text-gray-400 aspect-square" />
          <span className="hidden sm:block text-gray-400 grow">Search</span>
          <div
            aria-hidden
            className="hidden sm:flex items-center gap-x-1 text-sm text-gray-400 font-mono mx-1"
          >
            <kbd className="px-2 py-1 border border-gray-200 rounded-md shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] ">
              CTRL
            </kbd>
            <kbd className="px-2 py-1 border border-gray-200 rounded-md shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] ">
              K
            </kbd>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#656c85cc] z-[1000]" />
        <Dialog.Content
          className="fixed flex flex-col top-0 bg-white z-[1001] h-screen w-screen sm:left-1/2 sm:-translate-x-1/2 sm:w-[90vw] sm:max-w-screen-sm sm:h-auto sm:max-h-[var(--content-max-height)] sm:top-[var(--content-top)] sm:rounded-md p-4"
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
          <div className="relative flex flow-row gap-x-1 h-10 w-full text-gray-900 dark:placeholder-gray-400 dark:text-white">
            <MagnifyingGlassIcon className="absolute text-gray-400 inset-y-0 start-0 h-10 w-10 p-2.5 aspect-square flex items-center pointer-events-none" />
            <input
              className={classNames(
                className,
                'block flex-grow p-2 ps-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500',
              )}
              placeholder="Search"
              required
              onChange={handleSearchChange}
            />
            <Dialog.Close asChild className="grow-0 sm:hidden block">
              <button aria-label="Close">
                <XCircleIcon className="h-10 w-10 aspect-square flex items-center" />
              </button>
            </Dialog.Close>
          </div>
          {!!searchResults.length && (
            <ul className="overflow-y-scroll mt-4">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="hover:bg-blue-500 hover:text-white rounded-sm mt-1 p-1"
                >
                  <SearchItem result={result} />
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
