import type { Query, SearchResult, RankedSearchResult, AttributeType } from './types.js';
import { SEARCH_ATTRIBUTES_ORDERED } from './types.js';
import { extractField, SPACE_OR_PUNCTUATION } from './search.js';

export const POSITIONAL_SEARCH_ATTRIBUTES: AttributeType[] = ['content'] as const;

// Weights that prioritise headings over content
const TYPE_WEIGHTS = new Map([
  ['lvl1', 90],
  ['lvl2', 80],
  ['lvl3', 70],
  ['lvl4', 60],
  ['lvl5', 50],
  ['lvl6', 40],
  ['content', 0],
]);

/*
 * Generic `cmp` helper function
 *
 * @param left - left value
 * @param right - right value
 */
function cmp(left: number, right: number): number {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return +1;
  } else {
    return 0;
  }
}

/**
 * Build a RegExp that matches a single TOKEN bounded by SPACE_OR_PUNCTUATION, or string boundaries
 *
 * @param text - text to match, e.g. ` foo `, ` foo bar `, `foo bar`
 */
function buildRegExpToken(token: string): RegExp {
  return new RegExp(
    `(?:(?:${SPACE_OR_PUNCTUATION.source})|^)${token}(?:(?:${SPACE_OR_PUNCTUATION.source})|$)`,
    `${SPACE_OR_PUNCTUATION.flags}i`,
  );
}

/**
 * Compute the proximity between two queries, bounded by a limit
 *
 * @param record - parent search record
 * @param left - first query
 * @param right - second query
 * @param bound - upper limit on computed proximity
 */
function queryPairProximity(
  record: SearchResult,
  left: Query,
  right: Query,
  bound: number,
): number {
  // TODO: this is highly-nested, and probably slow
  //       it should be re-written for performance
  let bestProximity = bound;

  // For each term in the left query
  for (const [leftTerm, leftFields] of Object.entries(left.matches)) {
    const leftPattern = buildRegExpToken(leftTerm);

    // For each field matched with this left term
    for (const leftField of leftFields) {
      // Pull out the (left) field content
      const content = extractField(record, leftField);

      // For each term in the right query
      for (const [rightTerm, rightFields] of Object.entries(right.matches)) {
        const rightPattern = buildRegExpToken(rightTerm);
        // For each field matched with this right term
        for (const rightField of rightFields) {
          // Terms matching different fields can never be better than the bound
          if (leftField !== rightField) {
            continue;
          }

          // Find all of the matches in the content for each pattern
          const leftMatches = content.matchAll(leftPattern);
          const rightMatches = content.matchAll(rightPattern);

          // Iterate over match pairs
          for (const leftMatch of leftMatches) {
            for (const rightMatch of rightMatches) {
              // Find the ordered (start, stop) pairs for these two matches
              const [start, stop] =
                leftMatch.index < rightMatch.index
                  ? [leftMatch.index, rightMatch.index]
                  : [rightMatch.index, leftMatch.index];

              // Identify how many token separators there are in this range
              const numSeparators = Array.from(
                content.slice(start, stop).matchAll(SPACE_OR_PUNCTUATION),
              ).length;

              // Fast-path, can never beat 1!
              if (numSeparators === 1) {
                return 1;
              }

              // Does this result improve our current proximity?
              if (numSeparators < bestProximity) {
                bestProximity = numSeparators;
              }
            }
          }
        }
      }
    }
  }
  return bestProximity;
}

/**
 * Compute the associative pair-wise proximity of a search result
 *
 * @param result - search result
 * @param bound - upper bound on final proximity
 */
function wordsProximity(result: SearchResult, bound: number) {
  const queries: Query[] = result.queries;
  let proximity = 0;
  for (let i = 0; i < queries.length - 1; i++) {
    const left = queries[i];
    const right = queries[i + 1];

    proximity += queryPairProximity(result, left, right, bound);
  }
  return Math.min(proximity, bound);
}

/**
 * Identify the best-matched attribute and the match position
 *
 * @param result - search result
 */
function matchedAttributePosition(result: SearchResult): {
  attribute: AttributeType;
  position: number | undefined;
} {
  // Build mapping from fields to terms matching that field
  // i.e. invert and flatten `result.queries[...].matches`
  const fieldToTerms = new Map<string, string[]>();
  result.queries.forEach((query: Query) => {
    Object.entries(query.matches).forEach(([term, fields]) => {
      (fields as string[]).forEach((field: string) => {
        let terms = fieldToTerms.get(field);
        if (!terms) {
          terms = [];
          fieldToTerms.set(field, terms);
        }
        terms.push(term);
      });
    });
  });

  // Find first field that we matched
  const attribute = SEARCH_ATTRIBUTES_ORDERED.find((field) => fieldToTerms.has(field))!;

  let position;
  // If this field is positional, find the start of the text match
  if (POSITIONAL_SEARCH_ATTRIBUTES.includes(attribute)) {
    // Find the terms that this field matches
    const attributeTerms = fieldToTerms.get(attribute)!;
    // Extract the field value
    const value = extractField(result, attribute);
    // Match each term against the field value, and extract the match position
    const matchPositions = attributeTerms
      .flatMap(
        (term) =>
          Array.from(value.matchAll(buildRegExpToken(term))) as {
            index: number;
          }[],
      )
      .map((match) => match.index);
    // Find the smallest (earliest) match position
    position = Math.min(...matchPositions);
  }
  // Otherwise, we don't care about the position
  else {
    position = undefined;
  }

  return { attribute, position };
}
/**
 * Determine how many terms matched the corpus exactly
 *
 * @param result - search result
 */
function matchedExactWords(result: SearchResult) {
  const queries: Query[] = result.queries;
  const allMatches = queries.flatMap(
    // For each query (foo bar baz -> foo, then bar, then baz)
    (query: Query) =>
      Object.entries(query.matches).flatMap(
        // For each (match, matched fields) pair in the query matches
        ([match, fields]) => {
          const pattern = buildRegExpToken(match);
          return (fields as string[]).flatMap(
            // For each matched field
            (field: string) => {
                // Retrieve corpus and test for pattern
                const value = extractField(result, field);
                return Array.from(value.matchAll(pattern)).map((m) => (m ? query.term : undefined));
              },
            );
          },
        )
        .filter((item) => item),
  );
  const uniqueMatches = new Set(allMatches);
  return uniqueMatches.size;
}

/**
 * Determine the number of fuzzy matches in a search result
 *
 * @param result - search result
 */
function numberOfTypos(result: SearchResult): number {
  const queries: Query[] = result.queries;
  return queries
    .map((query: Query) => {
      const typoTerms = Object.keys(query.matches).filter((match) => match !== query.term);
      return typoTerms.length;
    })
    .reduce((sum: number, value: number) => sum + value, 0);
}

/**
 * Rank a search result using Algolia-derived metrics
 *
 * @param result - search result
 */
function rankSearchResult(result: SearchResult): RankedSearchResult {
  return {
    ...result,
    ranking: {
      typos: numberOfTypos(result),
      ...matchedAttributePosition(result),
      proximity: wordsProximity(result, 8), // TODO
      exact: matchedExactWords(result),
      level: TYPE_WEIGHTS.get(result.type)!,
      appearance: result.position,
    },
  };
}

/**
 * Compare ranked search results to prioritise higher rankings
 *
 * @param left - ranked search result
 * @param right - ranked search result
 */
function cmpRankedSearchResults(left: RankedSearchResult, right: RankedSearchResult) {
  const leftRank = left.ranking;
  const rightRank = right.ranking;

  if (leftRank.typos !== rightRank.typos) {
    return cmp(leftRank.typos, rightRank.typos);
  }
  if (leftRank.attribute !== rightRank.attribute) {
    const i = SEARCH_ATTRIBUTES_ORDERED.findIndex((item) => item === leftRank.attribute);
    const j = SEARCH_ATTRIBUTES_ORDERED.findIndex((item) => item === rightRank.attribute);

    return cmp(i, j);
  }
  if (
    leftRank.position != null &&
    rightRank.position != null &&
    leftRank.position !== rightRank.position
  ) {
    return cmp(leftRank.position, rightRank.position);
  }
  if (leftRank.proximity !== rightRank.proximity) {
    return cmp(leftRank.proximity, rightRank.proximity);
  }
  if (leftRank.exact !== rightRank.exact) {
    return cmp(rightRank.exact, leftRank.exact);
  }
  if (leftRank.level !== rightRank.level) {
    return cmp(rightRank.level, leftRank.level);
  }
  if (leftRank.appearance !== rightRank.appearance) {
    return cmp(leftRank.appearance, rightRank.appearance);
  }

  return 0;
}

/**
 * Rank and then filter raw search results
 */
export function rankResults(results: SearchResult[]): RankedSearchResult[] {
  return results.map(rankSearchResult).sort(cmpRankedSearchResults);
}
