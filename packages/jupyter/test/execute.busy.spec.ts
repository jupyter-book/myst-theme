import { describe, expect, test } from 'vitest';
import type { BusyScopeState } from '../src/execute/busy';
import {
  reducer,
  selectCellIsBusy,
  selectNotebookIsBusy,
  selectPageIsBusy,
} from '../src/execute/busy';

describe('execute busy scope behaviour', () => {
  describe('selectors', () => {
    test('selectCellIsBusy', () => {
      expect(selectCellIsBusy({ reset: {}, execute: {} }, 'R', 'NB', 'C', 'execute')).toEqual(
        false,
      );
      expect(selectCellIsBusy({ reset: {}, execute: {} }, 'R', 'NB', 'C', 'reset')).toBe(false);
      expect(
        selectCellIsBusy({ reset: { R: {} }, execute: { R: {} } }, 'R', 'NB', 'C', 'execute'),
      ).toBe(false);
      expect(selectCellIsBusy({ reset: { R: {} }, execute: {} }, 'R', 'NB', 'C', 'reset')).toBe(
        false,
      );
      expect(
        selectCellIsBusy({ reset: {}, execute: { R: { NB: {} } } }, 'R', 'NB', 'C', 'execute'),
      ).toBe(false);
      expect(
        selectCellIsBusy({ reset: { R: { NB: {} } }, execute: {} }, 'R', 'NB', 'C', 'reset'),
      ).toBe(false);
      expect(
        selectCellIsBusy(
          { reset: {}, execute: { R: { NB: { C: true } } } },
          'R',
          'NB',
          'C',
          'execute',
        ),
      ).toBe(true);
      expect(
        selectCellIsBusy(
          { reset: {}, execute: { R: { NB: { C: true } } } },
          'R',
          'NB',
          'C',
          'reset',
        ),
      ).toBe(false);
      expect(
        selectCellIsBusy(
          { reset: { R: { NB: { C: true } } }, execute: {} },
          'R',
          'NB',
          'C',
          'reset',
        ),
      ).toEqual(true);
      expect(
        selectCellIsBusy(
          { execute: {}, reset: { R: { NB: { C: true } } } },
          'R',
          'NB',
          'C',
          'execute',
        ),
      ).toBe(false);
    });
    test('selectNotebookIsBusy', () => {
      expect(selectNotebookIsBusy({ reset: {}, execute: {} }, 'R', 'NB', 'execute')).toBe(false);
      expect(selectNotebookIsBusy({ reset: {}, execute: { R: {} } }, 'R', 'NB', 'execute')).toBe(
        false,
      );
      expect(
        selectNotebookIsBusy({ reset: {}, execute: { R: { NB: {} } } }, 'R', 'NB', 'execute'),
      ).toBe(true);
      expect(
        selectNotebookIsBusy(
          { reset: {}, execute: { R: { NB: { C: true } } } },
          'R',
          'NB',
          'execute',
        ),
      ).toBe(true);
    });
    test('selectRenderIsBusy', () => {
      expect(selectPageIsBusy({ reset: {}, execute: {} }, 'R', 'execute')).toBe(false);
      expect(selectPageIsBusy({ reset: {}, execute: { R: {} } }, 'R', 'execute')).toBe(true);
      expect(selectPageIsBusy({ reset: {}, execute: { R: { NB: {} } } }, 'R', 'execute')).toBe(
        true,
      );
      expect(
        selectPageIsBusy({ reset: {}, execute: { R: { NB: { C: true } } } }, 'R', 'execute'),
      ).toBe(true);
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
          'execute',
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
          'execute',
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
          'execute',
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
          'execute',
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
        [
          'set first cell busy',
          'reset',
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
          'reset',
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
          'reset',
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
          'reset',
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
      ])('%s - %s', (s: string, kind: string, state: any, payload: any, result: any) => {
        expect(
          reducer(
            { execute: {}, reset: {}, [kind]: state },
            {
              type: 'SET_CELL_BUSY',
              payload: { ...payload, kind },
            },
          ),
        ).toEqual({ execute: {}, reset: {}, [kind]: result });
      });
      test('setting an already busy cell returns same state', () => {
        const state = {
          execute: {
            R: {
              NB: {
                C: true,
              },
            },
          },
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'SET_CELL_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellId: 'C',
              kind: 'execute',
            },
          }),
        ).toBe(state);
      });
      describe('clear cells busy', () => {
        test('return state - if no render exists', () => {
          const state: BusyScopeState = {
            execute: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
            reset: {},
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R',
                notebookSlug: 'NB',
                cellId: 'C',
                kind: 'execute',
              },
            }),
          ).toBe(state);
        });
        test('return state - if no notebook exists', () => {
          const state: BusyScopeState = {
            execute: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
            reset: {},
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R2',
                notebookSlug: 'NB',
                cellId: 'C',
                kind: 'execute',
              },
            }),
          ).toBe(state);
        });
        test('return state - if no cell exists', () => {
          const state: BusyScopeState = {
            execute: {
              R2: {
                NB2: {
                  C2: true,
                },
              },
            },
            reset: {},
          };
          expect(
            reducer(state, {
              type: 'CLEAR_CELL_BUSY',
              payload: {
                pageSlug: 'R2',
                notebookSlug: 'NB2',
                cellId: 'C',
                kind: 'execute',
              },
            }),
          ).toBe(state);
        });
        test.each([
          [
            'clear only cell in render, removes the render',
            'execute',
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
            'execute',
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
            'execute',
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
        ])('%s', (s: string, kind: string, state: any, payload: any, result: any) => {
          expect(
            reducer(
              { execute: {}, reset: {}, [kind]: state },
              {
                type: 'CLEAR_CELL_BUSY',
                payload: { ...payload, kind },
              },
            ),
          ).toEqual({ execute: {}, reset: {}, [kind]: result });
        });
      });
    });
    describe('set notebook busy', () => {
      test('set new notebook in new render', () => {
        const state: BusyScopeState = {
          execute: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'SET_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R2',
              notebookSlug: 'NB2',
              cellIds: ['C', 'C2', 'C3'],
              kind: 'execute',
            },
          }),
        ).toEqual({
          execute: {
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
          reset: {},
        });
      });
      test('set notebook in existing render', () => {
        const state: BusyScopeState = {
          execute: {
            R: {
              NB: {
                C99: true,
              },
            },
          },
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'SET_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              cellIds: ['C', 'C2', 'C3'],
              kind: 'execute',
            },
          }),
        ).toEqual({
          reset: {},
          execute: {
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
          execute: {
            R: {
              NB: {
                C: true,
                C2: true,
              },
            },
          },
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              kind: 'execute',
            },
          }),
        ).toEqual({
          execute: {},
          reset: {},
        });
      });
      test('clear existing notebook, when there are other busy notebooks', () => {
        const state: BusyScopeState = {
          execute: {
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
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB',
              kind: 'execute',
            },
          }),
        ).toEqual({
          reset: {},
          execute: {
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
          execute: {
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
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R',
              notebookSlug: 'NB3',
              kind: 'execute',
            },
          }),
        ).toEqual(state);
      });
      test('return state - no render exists', () => {
        const state: BusyScopeState = {
          execute: {
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
          reset: {},
        };
        expect(
          reducer(state, {
            type: 'CLEAR_NOTEBOOK_BUSY',
            payload: {
              pageSlug: 'R3',
              notebookSlug: 'NB3',
              kind: 'execute',
            },
          }),
        ).toEqual(state);
      });
    });
  });
});
