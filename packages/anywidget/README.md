# @myst-theme/any-widget

Extension interface and NodeRenderer following the [`any-widget`](https://github.com/manzt/anywidget) interfaces for embedding interactive widgets in MyST Markdown documents.

## Usage in MyST Markdown projects

The `anywidget` directive allows you to embed interactive widgets directly in your MyST markdown files. These widgets are ES modules that can be loaded from a URL and initialized with JSON data.

### Basic Usage

Using the `mystmd` you can add AnyWidgets using the following directive.

To include your widget, provide a reachable URL to the JS module, and optional css file.

```markdown
:::{anywidget} https://example.com/widget.mjs
:css: https://example.com/widget-styles.css
:class: border rounded p-4
{
"value": 42,
"name": "My Widget"
}
:::
```

### Directive Options

- `class`: Tailwind CSS classes to apply to the container element
- `css`: URL to a CSS stylesheet to load for the widget
- `static`: URL, File path, folder path, or glob pattern for static files to make available to the module

## Usage for developers and theme builders

This package provides two main entry points for different use cases:

1. **Directive** (Node/CLI context): A MyST directive specification for parsing `any:widget` and `any:bundle` directives in markdown
2. **React Renderers** (React context): React components for rendering AnyWidget components in the browser

### Installation

```bash
npm install @myst-theme/anywidget
```

### Adding Renderers to a Theme

If you're building a theme or React application that renders MyST documents, you'll need to add the React renderers to display the widgets.

**Import the renderers:**

```typescript
import { ANY_RENDERERS } from '@myst-theme/anywidget';
import { mergeRenderers } from '@myst-theme/providers';
import { Document } from '@myst-theme/providers';

function MyDocument({ ast }) {
  return (
    <Document
      ast={ast}
      renderers={mergeRenderers([defaultRenderers, ANY_RENDERERS])}
    />
  );
}
```

The renderers will automatically:

- Load the ES module from the specified URL
- Initialize the widget with the provided JSON data
- Handle CSS stylesheets (with shadow DOM support)
- Display error messages if the widget fails to load

### TypeScript Types

The package exports TypeScript types for type safety:

```typescript
import type { AnyWidgetDirective } from '@myst-theme/anywidget';
```

### Contributing

This package is part of the myst-theme monorepo. See the main repository for contribution guidelines.

## License

MIT
