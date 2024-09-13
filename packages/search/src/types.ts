// myst-spec-ext types
export type DocumentHierarchy = {
  lvl1?: string;
  lvl2?: string;
  lvl3?: string;
  lvl4?: string;
  lvl5?: string;
  lvl6?: string;
};

export type HeadingLevel = keyof DocumentHierarchy;

export type SearchRecordBase = {
  hierarchy: DocumentHierarchy;
  url: string;

  position: number;
};
export type HeadingRecord = SearchRecordBase & {
  type: HeadingLevel;
};
export type ContentRecord = SearchRecordBase & {
  type: 'content';
  content: string;
};

export type SearchRecord = ContentRecord | HeadingRecord;

export type MystSearchIndex = {
  version: '1';
  records: SearchRecord[];
};
///

export type Query = {
  term: string; // Raw search query term
  matches: Record<string, string[]>; // Match results (match token -> fields[])
};

export type SearchResult = SearchRecord & {
  id: string | number;
  queries: Query[];
};

export interface ISearch {
  (query: string): SearchResult[];
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
