import type { GenericNode, GenericParent } from 'myst-common';

export type Slide = {
  attrs: Record<string, string>;
  children: GenericNode[];
  notes: GenericNode[];
};

/** A horizontal position in the deck; more than one slide makes a vertical stack. */
export type Column = Slide[];

export type SplitOptions = {
  /**
   * Headings at this level start a slide; shallower headings start a column.
   * Levels count from 1 at the shallowest heading depth in the page.
   */
  slideLevel?: number;
};

type RiseType = 'slide' | 'subslide' | 'fragment' | 'skip' | 'notes' | '-';

const SLIDE_ATTR = /^(background|transition|auto-animate|autoslide$|visibility$|state$|timing$)/;

/** Convert block metadata to reveal.js `data-*` section attributes. */
export function slideAttrs(data?: Record<string, any>): Record<string, string> {
  const attrs: Record<string, string> = {};
  Object.entries(data ?? {}).forEach(([key, value]) => {
    if (!SLIDE_ATTR.test(key) || value === false || value == null) return;
    attrs[`data-${key}`] = value === true ? '' : String(value);
  });
  return attrs;
}

function riseType(node: GenericNode): RiseType | undefined {
  return node.data?.slideshow?.slide_type;
}

function isNotes(node: GenericNode): boolean {
  return node.type === 'div' && (node.class ?? '').split(/\s+/).includes('notes');
}

/**
 * Split a page tree into reveal.js columns.
 *
 * Without RISE metadata, `---` and headings at `slideLevel` start a slide, and
 * shallower headings start a column. `slideLevel` defaults to 2, or 1 if the
 * page has one heading level. A slide joins the current column only if a column
 * break opened it. With any `slideshow.slide_type` metadata, headings do not
 * split: `slide` starts a column and `subslide` starts a slide.
 */
export function splitSlides(tree: GenericParent, opts: SplitOptions = {}): Column[] {
  const blocks: GenericParent[] = tree.children.map((node) =>
    node.type === 'block' ? (node as GenericParent) : { type: 'block', children: [node] },
  );
  const rise = blocks.some((block) => riseType(block));
  const depths = [
    ...new Set(
      blocks.flatMap((block) =>
        block.children.filter((n) => n.type === 'heading').map((n) => n.depth as number),
      ),
    ),
  ].sort((a, b) => a - b);
  const level = (node: GenericNode) => depths.indexOf(node.depth) + 1;
  const slideLevel = opts.slideLevel ?? Math.min(2, depths.length);
  const columns: Column[] = [];
  let columnOpen = false;
  let slide: Slide | undefined;

  function newSlide(kind: 'column' | 'slide') {
    slide = { attrs: {}, children: [], notes: [] };
    if (kind === 'column' || !columnOpen) columns.push([slide]);
    else columns[columns.length - 1].push(slide);
    if (kind === 'column') columnOpen = true;
  }

  function current(): Slide {
    if (!slide) newSlide('slide');
    return slide as Slide;
  }

  blocks.forEach((block) => {
    const type = riseType(block);
    if (type === 'skip') return;
    if (type === 'slide') newSlide('column');
    if (type === 'subslide') newSlide('slide');
    if (type === 'notes') {
      current().notes.push(...block.children);
      return;
    }
    const attrs = slideAttrs(block.data);
    let target: Slide | undefined;
    let part: GenericNode[] = [];
    let first = true;

    function flush() {
      if (part.length === 0) return;
      const copy: GenericParent = { ...block, children: part };
      if (!first) {
        delete copy.identifier;
        delete copy.label;
        delete copy.html_id;
      }
      if (type === 'fragment') copy.class = `${copy.class ?? ''} fragment`.trim();
      current().children.push(copy);
      target ??= current();
      first = false;
      part = [];
    }

    block.children.forEach((node) => {
      if (node.type === 'thematicBreak') {
        flush();
        newSlide('slide');
      } else if (isNotes(node)) {
        current().notes.push(...(node.children ?? []));
      } else if (!rise && node.type === 'heading' && level(node) <= slideLevel) {
        flush();
        newSlide(level(node) < slideLevel ? 'column' : 'slide');
        part.push(node);
      } else {
        part.push(node);
      }
    });
    flush();
    Object.assign((target ?? current()).attrs, attrs);
  });

  return columns
    .map((column) =>
      column.filter(
        (s) => s.children.length > 0 || s.notes.length > 0 || Object.keys(s.attrs).length > 0,
      ),
    )
    .filter((column) => column.length > 0);
}
