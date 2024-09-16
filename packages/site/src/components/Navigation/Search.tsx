import { useEffect, useState, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  HashtagIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ISearch, RankedSearchResult, HeadingLevel } from '@myst-theme/search';
import { SPACE_OR_PUNCTUATION, rankAndFilterResults } from '@myst-theme/search';
import { withBaseurl, useBaseurl, useThemeTop } from '@myst-theme/providers';

/**
 * Implement basic HTML highlighting of the given text according to the found matches
 *
 * @param text - text to highlight
 * @param result - search result to use for highlighting
 */
function HighlightedTokens({
  tokens,
  matches,
  limit,
}: {
  tokens: string[];
  matches: string[];
  limit?: number;
}) {
  // Build RegExp matching all highlight matches
  const allTerms = matches.join('|');
  const pattern = new RegExp(`^(${allTerms})`, 'i'); // Match prefix and total pattern, case-insensitively
  const renderToken = (token: string) =>
    pattern.test(token) ? (
      <>
        {} <mark>{token}</mark>
      </>
    ) : (
      <> {token}</>
    );
  if (limit === undefined) {
    const firstRenderer = pattern.test(tokens[0]) ? (
      <mark>{tokens[0]}</mark>
    ) : (
      <span>{tokens[0]}</span>
    );
    const remainingRenderers = tokens.slice(1).map((token) => renderToken(token));

    return <> {firstRenderer} {...remainingRenderers} </>;
  } else {
    const firstIndex = tokens.findIndex((token) => pattern.test(token));
    if (firstIndex === undefined) {
      return <>{...tokens}</>;
    }
    const firstRenderer = <mark>{tokens[firstIndex]}</mark>;
    const remainingTokens = tokens.slice(firstIndex + 1, firstIndex + 1 + limit);
    const remainingRenderers = remainingTokens.map((token) => renderToken(token));

    return (
      <>
        {}... {firstRenderer}
        {...remainingRenderers} ...{}
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

  const titleTokens = title.split(SPACE_OR_PUNCTUATION);
  const titleRenderer = (
    <HighlightedTokens
      tokens={titleTokens}
      matches={matches}
      limit={type === 'content' ? 16 : undefined}
    />
  );

  let subtitleRenderer;
  if (result.type === 'lvl1') {
    subtitleRenderer = undefined;
  } else {
    const subtitle = result.hierarchy.lvl1!;
    const subtitleTokens = subtitle.split(SPACE_OR_PUNCTUATION);
    subtitleRenderer = <HighlightedTokens tokens={subtitleTokens} matches={matches} />;
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
            'flex items-center w-10 h-10 sm:w-64 border border-gray-300 rounded-lg bg-gray-50 hover:ring-blue-500 hover:border-blue-500 dark:bg-gray-700 dark:border-gray-600 text-left dark:hover:ring-blue-500 dark:hover:border-blue-500',
          )}
        >
          <MagnifyingGlassIcon className="px-2 w-10 h-10 text-gray-400 aspect-square" />
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
          className="fixed flex flex-col left-1/2 -translate-x-1/2 w-[50vw] max-w-screen-sm bg-white z-[1001] rounded-md p-4"
          style={{ top, maxHeight: `calc(90vh - ${top}px)` }}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Search Website</Dialog.Title>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <Dialog.Description>
              Search articles and their contents using fuzzy-search and prefix-matching
            </Dialog.Description>
          </VisuallyHidden.Root>
          <div className="relative w-full text-gray-900 dark:placeholder-gray-400 dark:text-white">
            <MagnifyingGlassIcon className="absolute text-gray-400 inset-y-0 start-0 w-8 h-full aspect-square flex items-center ps-3 pointer-events-none" />
            <input
              className={classNames(
                className,
                'block w-full p-2 ps-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500',
              )}
              placeholder="Search"
              required
              onChange={handleSearchChange}
            />
          </div>
          {!!searchResults.length && (
            <ul className="overflow-y-scroll">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="hover:bg-blue-500 hover:text-white rounded-sm mt-1 p-1"
                >
                  {' '}
                  <SearchItem result={result} />{' '}
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
