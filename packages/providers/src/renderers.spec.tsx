import { describe, it, expect } from 'vitest';
import type { NodeRenderer, NodeRenderers, NodeRenderersValidated } from './renderers.js'; // Update with your actual file path
import { validateRenderers, mergeRenderers } from './renderers.js'; // Update with your actual file path

// Example NodeRenderer components
const ParagraphRenderer: NodeRenderer = (props) => <p>{props.node.children}</p>;
const HeadingRenderer: NodeRenderer = (props) => <h1>{props.node.children}</h1>;
const HeadingLevel2Renderer: NodeRenderer = (props) => <h2>{props.node.children}</h2>;
const LinkRenderer: NodeRenderer = (props) => <a href={props.node.url}>{props.node.children}</a>;
const CustomHeadingRenderer: NodeRenderer = (props) => (
  <h1 className="custom-heading">{props.node.children}</h1>
);

describe('validateRenderers', () => {
  it('should validate and normalize a renderer that is a single function', () => {
    const renderers: NodeRenderers = {
      paragraph: ParagraphRenderer,
    };

    const validated = validateRenderers(renderers);

    expect(validated).toEqual({
      paragraph: { base: ParagraphRenderer },
    });
  });

  it('should validate and normalize a renderer that contains a base function', () => {
    const renderers: NodeRenderers = {
      heading: {
        base: HeadingRenderer,
        level2: HeadingLevel2Renderer,
      },
    };

    const validated = validateRenderers(renderers);

    expect(validated).toEqual({
      heading: {
        base: HeadingRenderer,
        level2: HeadingLevel2Renderer,
      },
    });
  });

  it('should throw an error if a renderer is missing a base function', () => {
    const renderers: NodeRenderers = {
      heading: {
        level2: HeadingLevel2Renderer,
      },
    };

    expect(() => validateRenderers(renderers)).toThrowError(
      'Renderer for "heading" must be either a function or an object containing a "base" renderer.',
    );
  });
});

describe('mergeRenderers', () => {
  it('should merge two renderers, with the second one overriding the first', () => {
    const renderers1: NodeRenderers = {
      paragraph: ParagraphRenderer,
      heading: HeadingRenderer,
    };

    const renderers2: NodeRenderers = {
      heading: HeadingLevel2Renderer, // This should override HeadingRenderer
      link: LinkRenderer,
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      paragraph: { base: ParagraphRenderer },
      heading: { base: HeadingLevel2Renderer },
      link: { base: LinkRenderer },
    });
  });

  it('should handle merging multiple renderers, with the last one taking precedence', () => {
    const renderers1: NodeRenderers = {
      heading: {
        base: HeadingRenderer,
        level2: HeadingLevel2Renderer,
      },
    };

    const renderers2: NodeRenderers = {
      heading: CustomHeadingRenderer, // This should override HeadingRenderer
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      heading: {
        base: CustomHeadingRenderer,
        level2: HeadingLevel2Renderer,
      },
    });
  });

  it('should correctly merge when there is no overlap between renderers', () => {
    const renderers1: NodeRenderers = {
      paragraph: ParagraphRenderer,
    };

    const renderers2: NodeRenderers = {
      link: LinkRenderer,
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      paragraph: { base: ParagraphRenderer },
      link: { base: LinkRenderer },
    });
  });

  it('should deeply merge objects if both renderers have objects for the same key', () => {
    const renderers1: NodeRenderers = {
      heading: {
        base: HeadingRenderer,
      },
    };

    const renderers2: NodeRenderers = {
      heading: {
        level2: HeadingLevel2Renderer,
      },
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      heading: {
        base: HeadingRenderer,
        level2: HeadingLevel2Renderer,
      },
    });
  });

  it('should override scalar values with objects if there is a conflict', () => {
    const renderers1: NodeRenderers = {
      heading: HeadingRenderer, // Scalar value
    };

    const renderers2: NodeRenderers = {
      heading: {
        base: CustomHeadingRenderer, // Object
      },
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      heading: {
        base: CustomHeadingRenderer,
      },
    });
  });

  it('should override objects with scalar values if there is a conflict', () => {
    const renderers1: NodeRenderers = {
      heading: {
        base: HeadingRenderer, // Object
      },
    };

    const renderers2: NodeRenderers = {
      heading: CustomHeadingRenderer, // Scalar value
    };

    const merged = mergeRenderers([renderers1, renderers2]);

    expect(merged).toEqual({
      heading: { base: CustomHeadingRenderer },
    });
  });
});
