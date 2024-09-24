import type { SearchRecord, DocumentHierarchy } from 'myst-spec-ext';
export type { MystSearchIndex, SearchRecord } from 'myst-spec-ext';

export type HeadingLevel = keyof DocumentHierarchy;

export type Query = {
  term: string; // Raw search query term
  matches: Record<string, string[]>; // Match results (match token -> fields[])
};

export type SearchResult = SearchRecord & {
  id: string | number;
  queries: Query[];
};

export interface ISearch {
  (query: string): Promise<SearchResult[] | undefined>;
}

/// Search ranking
export const SEARCH_ATTRIBUTES_ORDERED = [
  'hierarchy.lvl1',
  'hierarchy.lvl2',
  'hierarchy.lvl3',
  'hierarchy.lvl4',
  'hierarchy.lvl5',
  'hierarchy.lvl6',
  'content',
] as const;

export type AttributeType = (typeof SEARCH_ATTRIBUTES_ORDERED)[number];

/**
 * Type describing a seach result that has ranking
 */
export type RankedSearchResult = SearchResult & {
  ranking: {
    // words: number; (Aloglia supports dropping words, we don't)
    typos: number;
    attribute: AttributeType;
    position?: number;
    proximity: number;
    exact: number;
    level: number;
    appearance: number;
  };
};
