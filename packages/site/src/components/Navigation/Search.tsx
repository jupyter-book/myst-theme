import { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  HashtagIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import type { ISearch, RankedSearchResult, HeadingLevel } from '@myst-theme/search';
import { SPACE_OR_PUNCTUATION, rankAndFilterResults } from '@myst-theme/search';
import { withBaseurl, useBaseurl } from '@myst-theme/providers';

function matchAll(text: string, pattern: RegExp) {
  const matches = [];
  let match;
  while ((match = pattern.exec(text))) {
    matches.push(match);
  }
  return matches;
}

function highlightTitle(text: string, result: RankedSearchResult): string {
  const allTerms = result.queries.flatMap((query) => Object.keys(query.matches)).join('|');
  const pattern = new RegExp(`\\b(${allTerms})\\b`, 'gi');
  const allMatches = Array.from(matchAll(text, pattern)).map((m) => m);

  const { index: start } = allMatches[0] ?? { index: 0 };

  const tokens = [
    ...matchAll(text.slice(start), SPACE_OR_PUNCTUATION),
    { index: text.length - start },
  ];

  const limitedTokens = tokens.slice(0, 16);
  const { index: offset } = limitedTokens[limitedTokens.length - 1];

  let title = text.slice(start, start + offset).replace(pattern, '<strong>$&</strong>');
  if (start !== 0) {
    title = `... ${title}`;
  }
  if (offset !== text.length) {
    title = `${title} ...`;
  }

  return title;
}

function SearchItem({ result }: { result: RankedSearchResult }) {
  const { hierarchy, type, url } = result;
  const baseURL = useBaseurl();

  // Generic "this document matched"
  const kind = type === 'content' ? 'text' : type === 'lvl1' ? 'file' : 'heading';
  const title = highlightTitle(
    result.type === 'content' ? result['content'] : hierarchy[type as HeadingLevel]!,
    result,
  );

  const icon =
    kind === 'file' ? (
      <DocumentTextIcon className="w-6 inline-block mx-2" />
    ) : kind === 'heading' ? (
      <HashtagIcon className="w-6 inline-block mx-2" />
    ) : (
      <PencilIcon className="w-6 inline-block mx-2" />
    );
  return (
    <a href={withBaseurl(url, baseURL)}>
      <div>
        {icon}
        <span dangerouslySetInnerHTML={{ __html: title }} />
      </div>
    </a>
  );
}

export function Search({ className, doSearch }: { className?: string; doSearch: ISearch }) {
  const [searchResults, setSearchResults] = useState<RankedSearchResult[]>([]);
  const [query, setQuery] = useState<string>();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query != undefined) {
        const rankedResults = rankAndFilterResults(doSearch(query));
        setSearchResults(rankedResults);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [doSearch, query]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="relative w-64 text-gray-900 dark:placeholder-gray-400 dark:text-white">
          <MagnifyingGlassIcon className="absolute text-gray-400 inset-y-0 start-0 w-8 h-full aspect-square flex items-center ps-3 pointer-events-none" />
          <button
            className={classNames(
              className,
              'block w-full p-2 ps-10 border border-gray-300 rounded-lg bg-gray-50 hover:ring-blue-500 hover:border-blue-500 dark:bg-gray-700 dark:border-gray-600 text-left dark:hover:ring-blue-500 dark:hover:border-blue-500',
            )}
          >
            Search
          </button>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#000000b3] z-10" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] max-w-screen-sm bg-white z-[11] rounded-md p-4">
          <div className="relative w-full text-gray-900 dark:placeholder-gray-400 dark:text-white mb-4">
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

          <ul>
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

          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close"></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
