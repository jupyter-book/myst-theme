import type { GenericParent } from 'myst-common';

export function splitByHeader(
  mdast: GenericParent,
  depth?: number | undefined,
): {
  head: GenericParent | undefined;
  body: GenericParent;
} {
  let i;
  for (i = 0; i < mdast.children.length; i++) {
    const node = mdast.children[i];
    if (node.type === 'heading' && (depth === undefined || node.depth === depth)) {
      break;
    }
  }
  if (i === mdast.children.length) {
    return {
      head: undefined,
      body: { type: 'block', children: mdast.children as any },
    };
  } else {
    return {
      head: { type: 'block', children: mdast.children.slice(0, i + 1) as any },
      body: { type: 'block', children: mdast.children.slice(i + 1) as any },
    };
  }
}
