import { describe, it, expect } from 'vitest';
import { parseCellIdFragment } from './hashLink.js';

describe('parseCellIdFragment', () => {
  it('extracts the bare id from a #cell-id= fragment', () => {
    expect(parseCellIdFragment('#cell-id=9bd1512c-9ca1-4695-9213-3a55b83903d5')).toBe(
      '9bd1512c-9ca1-4695-9213-3a55b83903d5',
    );
  });

  it('returns null for a bare fragment without the prefix', () => {
    expect(parseCellIdFragment('#9bd1512c-9ca1-4695-9213-3a55b83903d5')).toBe(null);
  });

  it('returns null for an empty cell-id', () => {
    expect(parseCellIdFragment('#cell-id=')).toBe(null);
  });

  it('returns null for an empty hash', () => {
    expect(parseCellIdFragment('')).toBe(null);
  });

  it('decodes URL-encoded ids', () => {
    expect(parseCellIdFragment('#cell-id=my%20cell')).toBe('my cell');
    expect(parseCellIdFragment('#cell-id=a%2Fb')).toBe('a/b');
  });
});
