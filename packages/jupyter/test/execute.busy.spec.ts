import { describe, expect, test } from 'vitest';
import type { BusyScopeState } from '../src/execute/busy';
import {
  reducer,
  selectCellIsBusy,
  selectNotebookIsBusy,
  selectRenderIsBusy,
} from '../src/execute/busy';

describe('execute busy scope behaviour', () => {
  describe('selectors', () => {
    test('selectCellIsBusy', () => {
      expect(selectCellIsBusy({ pages: {} }, 'R', 'NB', 'C')).toBe(false);
      expect(selectCellIsBusy({ pages: { R: {} } }, 'R', 'NB', 'C')).toBe(false);
      expect(selectCellIsBusy({ pages: { R: { NB: {} } } }, 'R', 'NB', 'C')).toBe(false);
      expect(selectCellIsBusy({ pages: { R: { NB: { C: true } } } }, 'R', 'NB', 'C')).toBe(true);
    });
    test('selectNotebookIsBusy', () => {
      expect(selectNotebookIsBusy({ pages: {} }, 'R', 'NB')).toBe(false);
      expect(selectNotebookIsBusy({ pages: { R: {} } }, 'R', 'NB')).toBe(false);
      expect(selectNotebookIsBusy({ pages: { R: { NB: {} } } }, 'R', 'NB')).toBe(true);
      expect(selectNotebookIsBusy({ pages: { R: { NB: { C: true } } } }, 'R', 'NB')).toBe(true);
    });
    test('selectRenderIsBusy', () => {
      expect(selectRenderIsBusy({ pages: {} }, 'R')).toBe(false);
      expect(selectRenderIsBusy({ pages: { R: {} } }, 'R')).toBe(true);
      expect(selectRenderIsBusy({ pages: { R: { NB: {} } } }, 'R')).toBe(true);
      expect(selectRenderIsBusy({ pages: { R: { NB: { C: true } } } }, 'R')).toBe(true);
    });
  });
  describe('reducer', () => {
    test('returns state for unknown actions', () => {
      expect(reducer({} as any, { type: 'UNKNOWN' } as any)).toEqual({});
    });
    describe('set cells busy', () => {
      test.each([
        [
          'set first cell busy',
          {},
          {
            pageSlug: 'R',
            notebookSlug: 'NB',
            cellId: 'C',
          },
          {
            R: {
              NB: {
                C: true,
              },
            },
          },
        ],
        [
          'set another cell in same render busy',
          {
            R: {
              NB: {
                C: true,
              },
            },
          },
          {
            pageSlug: 'R',
            notebookSlug: 'NB',
            cellId: 'C2',
          },
          {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
        ],
        [
          'set cell in another notebook busy',
          {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
          {
            pageSlug: 'R',

            notebookSlug: 'NB2',
            cellId: 'C',
          },
          {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
          },
        ],
        [
          'set cell in another render busy',
          {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
          },
          {
            pageSlug: 'R2',
            notebookSlug: 'NB',
            cellId: 'C',
          },
          {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
            R2: {
              NB: {
                C: true,
              },
            },
          },
        ],
      ])('%s', (s: string, pages: any, payload: any, result: any) => {
        expect(
          reducer(
            { pages },
            {
              type: 'SET_CELL_BUSY',
              payload,
            },
          ),
        ).toEqual({ pages: result });
      });
      test('setting an already busy cell returns same state', () => {
        const state = {
          pages: {
            R: {
              NB: {
                C: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'SET_CELL_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellId: 'C',
            },
          }),
        ).toBe(state);
      });
      describe('clear cells busy', () => {
        test('return state - if no render exists', () => {
          const state: BusyScopeState = {
            pages: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R',
                notebookSlug: 'NB',
                cellId: 'C',
              },
            }),
          ).toBe(state);
        });
        test('return state - if no notebook exists', () => {
          const state: BusyScopeState = {
            pages: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R2',
                notebookSlug: 'NB',
                cellId: 'C',
              },
            }),
          ).toBe(state);
        });
        test('return state - if no cell exists', () => {
          const state: BusyScopeState = {
            pages: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R2',
                notebookSlug: 'NB2',
                cellId: 'C',
              },
            }),
          ).toBe(state);
        });
        test.each([
          [
            'clear only cell in render, removes the render',
            {
              R: {
                NB: {
                  C: true,
                },
              },
            },
            {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellId: 'C',
            },
            {},
          ],
          [
            'clear only cell in notebook, removes the notebook',
            {
              R: {
                NB: {
                  C: true,
                },
                NB2: {
                  C: true,
                },
              },
            },
            {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellId: 'C',
            },
            {
              R: {
                NB2: {
                  C: true,
                },
              },
            },
          ],
          [
            'clear cell in a notebook',
            {
              R: {
                NB: {
                  C: true,
                  C2: true,
                },
                NB2: {
                  C: true,
                },
              },
            },
            {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellId: 'C',
            },
            {
              R: {
                NB: {
                  C2: true,
                },
                NB2: {
                  C: true,
                },
              },
            },
          ],
        ])('%s', (s: string, pages: any, payload: any, result: any) => {
          expect(
            reducer(
              { pages },
              {
                type: 'CLEAR_CELL_BUSY',
                payload,
              },
            ),
          ).toEqual({ pages: result });
        });
      });
    });
    describe('set notebook busy', () => {
      test('set new notebook in new render', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'SET_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R2',
              notebookSlug: 'NB2',
              cellIds: ['C', 'C2', 'C3'],
            },
          }),
        ).toEqual({
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
            R2: {
              NB2: {
                C: true,
                C2: true,
                C3: true,
              },
            },
          },
        });
      });
      test('set notebook in existing render', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C99: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'SET_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellIds: ['C', 'C2', 'C3'],
            },
          }),
        ).toEqual({
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
                C3: true,
                C99: true,
              },
            },
          },
        });
      });
    });
    describe('clear notebook busy', () => {
      test('clear existing notebook', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
            },
          }),
        ).toEqual({
          pages: {},
        });
      });
      test('clear existing notebook, when there are other busy notebooks', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
            },
          }),
        ).toEqual({
          pages: {
            R: {
              NB2: {
                C: true,
              },
            },
          },
        });
      });
      test('return state - no notebook exists', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB3',
            },
          }),
        ).toEqual(state);
      });
      test('return state - no render exists', () => {
        const state: BusyScopeState = {
          pages: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
              NB2: {
                C: true,
              },
            },
          },
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R3',
              notebookSlug: 'NB3',
            },
          }),
        ).toEqual(state);
      });
    });
  });
});
