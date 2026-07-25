import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';
import './styles.css';

// 1. A renderer for the custom `fancyNote` node created by the fancy-note directive.
function FancyNote({ node }) {
  return (
    <aside className="fancy-note">
      <div className="fancy-note-title">✨ {node.title ?? 'Fancy note'}</div>
      <MyST ast={node.children} />
    </aside>
  );
}

// 2. Lightly modify a built-in node by wrapping the theme's default renderer.
const Blockquote = DEFAULT_RENDERERS.blockquote.base;
function FancyBlockquote(props) {
  return (
    <div className="fancy-quote">
      <Blockquote {...props} />
    </div>
  );
}

// Each key of `renderers` is a MyST AST node type.
// A new type (fancyNote) adds support for a custom node.
// An existing type (blockquote) replaces the theme's built-in renderer for that node.
export default {
  renderers: {
    fancyNote: FancyNote,
    blockquote: FancyBlockquote,
  },
};
