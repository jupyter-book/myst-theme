import { describe, expect, test } from 'vitest';
import type { GenericNode, GenericParent } from 'myst-common';
import { splitSlides, slideAttrs } from './slides';

const p = (value: string): GenericNode => ({
  type: 'paragraph',
  children: [{ type: 'text', value }],
});
const h = (depth: number, value: string): GenericNode => ({
  type: 'heading',
  depth,
  children: [{ type: 'text', value }],
});
const hr: GenericNode = { type: 'thematicBreak' };
const block = (children: GenericNode[], data?: Record<string, any>): GenericNode => ({
  type: 'block',
  children,
  ...(data ? { data } : {}),
});
const root = (...children: GenericNode[]): GenericParent => ({ type: 'root', children });

/** Summarize each column as a list of slides, each a list of text values. */
function texts(tree: GenericParent, slideLevel?: number): (string | undefined)[][][] {
  return splitSlides(tree, { slideLevel }).map((column) =>
    column.map((slide) =>
      slide.children.flatMap((b) =>
        (b.children ?? []).map((n: GenericNode) => n.children?.[0]?.value),
      ),
    ),
  );
}

describe('splitSlides', () => {
  test('h2 and --- start horizontal slides', () => {
    const tree = root(block([p('intro'), h(2, 'A'), p('a'), hr, p('b'), h(2, 'C')]));
    expect(texts(tree)).toEqual([[['intro']], [['A', 'a']], [['b']], [['C']]]);
  });

  test('h1 starts a column that stacks following slides', () => {
    const tree = root(
      block([p('intro'), h(1, 'S1'), h(2, 'A'), hr, p('b'), h(1, 'S2'), h(2, 'C')]),
    );
    expect(texts(tree)).toEqual([[['intro']], [['S1'], ['A'], ['b']], [['S2'], ['C']]]);
  });

  test('heading levels count from the shallowest depth', () => {
    const tree = root(block([h(2, 'S1'), h(3, 'A'), h(2, 'S2')]));
    expect(texts(tree)).toEqual([[['S1'], ['A']], [['S2']]]);
  });

  test('a single heading level gives a flat deck', () => {
    const tree = root(block([h(3, 'A'), hr, p('b'), h(3, 'C')]));
    expect(texts(tree)).toEqual([[['A']], [['b']], [['C']]]);
  });

  test('headings render as h1 for columns and h2 for slides', () => {
    const tree = root(block([h(2, 'S'), h(3, 'A'), h(4, 'sub'), h(2, 'T')]));
    const depths = splitSlides(tree).flatMap((c) =>
      c.flatMap((s) =>
        s.children.flatMap((b) => (b.children ?? []).map((n: GenericNode) => n.depth)),
      ),
    );
    expect(depths).toEqual([1, 2, 3, 1]);
  });

  test('slideLevel 1 gives a flat deck', () => {
    const tree = root(block([h(1, 'A'), h(2, 'sub'), h(1, 'B')]));
    expect(texts(tree, 1)).toEqual([[['A', 'sub']], [['B']]]);
  });

  test('block metadata sets attributes on the slide of its first node', () => {
    const tree = root(
      block([h(2, 'A'), p('a')]),
      block([p('more')], { 'background-color': 'navy', tags: ['x'] }),
      block([h(2, 'B')], { 'auto-animate': true }),
    );
    const columns = splitSlides(tree);
    expect(columns.map((c) => c[0].attrs)).toEqual([
      { 'data-background-color': 'navy' },
      { 'data-auto-animate': '' },
    ]);
  });

  test('notes divs move to slide notes', () => {
    const notes = { type: 'div', class: 'notes', children: [p('say this')] };
    const [[slide]] = splitSlides(root(block([h(2, 'A'), notes])));
    expect(slide.notes).toEqual([p('say this')]);
    expect(slide.children[0].children).toEqual([h(2, 'A')]);
  });

  test('split blocks keep their identifier on the first part only', () => {
    const tree = root({ ...block([p('a'), hr, p('b')]), identifier: 'cell' });
    const ids = splitSlides(tree).map((c) => c[0].children[0].identifier);
    expect(ids).toEqual(['cell', undefined]);
  });

  test('RISE metadata controls slides and headings do not split', () => {
    const rise = (slide_type: string) => ({ slideshow: { slide_type } });
    const tree = root(
      block([h(1, 'Title')], rise('slide')),
      block([h(2, 'kept')], rise('-')),
      block([p('frag')], rise('fragment')),
      block([p('down')], rise('subslide')),
      block([p('hidden')], rise('skip')),
      block([p('note')], rise('notes')),
      block([p('next')], rise('slide')),
    );
    expect(texts(tree)).toEqual([[['Title', 'kept', 'frag'], ['down']], [['next']]]);
    const [[first, second]] = splitSlides(tree);
    expect(first.children[2].class).toBe('fragment');
    expect(second.notes).toEqual([p('note')]);
  });
});

describe('slideAttrs', () => {
  test('keeps reveal.js keys only', () => {
    expect(
      slideAttrs({
        'background-image': 'a.png',
        transition: 'zoom',
        visibility: 'hidden',
        autoslide: 2000,
        'auto-animate': false,
        slideshow: {},
        collapsed: true,
      }),
    ).toEqual({
      'data-background-image': 'a.png',
      'data-transition': 'zoom',
      'data-visibility': 'hidden',
      'data-autoslide': '2000',
    });
  });
});
