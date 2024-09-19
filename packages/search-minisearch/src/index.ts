import MiniSearch, { type Options, type SearchResult as MiniSearchResult } from 'minisearch';
import type { SearchRecord, SearchResult, ISearch } from '@myst-theme/search';
import { extractField } from '@myst-theme/search';

export type ExtendedOptions = Options & Required<Pick<Options, 'tokenize' | 'processTerm'>>;

export function prepareOptions(options: Options): ExtendedOptions {
  return {
    ...options,
    tokenize: MiniSearch.getDefault('tokenize'),
    processTerm: MiniSearch.getDefault('processTerm'),
    extractField
  };
}

export type RawSearchResult = SearchRecord & MiniSearchResult;

export function combineResults(results: Map<string, Map<string, RawSearchResult>>): SearchResult[] {
  const [firstEntry, ...restEntries] = results.entries();
  if (firstEntry === undefined) {
    return [];
  }
  // Transform from { terms, queryTerms, match} to [ { term, matches} ]
  const firstRawResults = firstEntry[1];
  const initialValue = new Map<string, SearchResult>(
    Array.from(firstRawResults.entries(), ([id, rawResult]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, score, terms, queryTerms, match, ...rest } = rawResult;
      return [
        id,
        {
          id,
          queries: [
            {
              term: queryTerms[0],
              matches: match,
            },
          ],
          ...rest,
        },
      ];
    }),
  );
  // Reduce all entries with this transform
  const mergedResults = restEntries.reduce(
    (accumulator: Map<string, SearchResult>, value: [string, Map<string, RawSearchResult>]) => {
      const nextAccumulator = new Map<string, SearchResult>();

      const rawResults = value[1];
      rawResults.forEach((rawResult, docID) => {
        const existing = accumulator.get(docID);
        if (existing == null) {
          return;
        }
        const { queryTerms, match } = rawResult;
        existing.queries.push({
          term: queryTerms[0],
          matches: match,
        });
        nextAccumulator.set(docID, existing);
      });
      return nextAccumulator;
    },
    initialValue,
  );
  return Array.from(mergedResults.values());
}

export function createSearch(documents: SearchRecord[], options: Options): ISearch {
  const extendedOptions = prepareOptions(options);
  const search = new MiniSearch(extendedOptions);
  search.addAll(documents.map((doc, index) => ({ ...doc, id: index })));
  return (query: string) => {
    // Implement executeQuery whilst retaining distinction between terms
    // TODO: should we check for unique terms?
    const terms = extendedOptions.tokenize(query);
    const termResults = new Map(
      terms.map((term) => [
        term,
        new Map(search.search(term).map((doc) => [doc.id, doc as RawSearchResult])),
      ]),
    );

    return combineResults(termResults);
  };
}
