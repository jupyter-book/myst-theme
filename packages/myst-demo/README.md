# myst-demo

[![myst-demo on npm](https://img.shields.io/npm/v/myst-demo.svg)](https://www.npmjs.com/package/myst-demo)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/curvenote/curvenote/blob/main/LICENSE)

A demo component for MyST Markdown, for example, [in the sandbox](https://mystmd.org/sandbox).

[![](/images/myst-demo.png)](https://mystmd.org/sandbox)

## Usage

The `<MySTRenderer>` is a React component that can take a string `value` that is the markdown that you want to render. It can work in two-column mode or in a column. The component shows the preview, the abstract syntax tree (AST), HTML, LaTeX, JATS and can download a Word Document all in the browser!!

```jsx
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { TabStateProvider, UiStateProvider } from '@myst-theme/providers';
import { MySTRenderer } from 'myst-demo';

function MySTSandbox({ value }: { value: string }) {
  return (
    <TabStateProvider>
      <UiStateProvider>
        <MySTRenderer value={value} column fullscreen TitleBlock={FrontmatterBlock} />
      </UiStateProvider>
    </TabStateProvider>
  );
}
```

For full functionality between components, you can wrap the component with various providers from `@myst-theme/providers`. These provide user interface state, such as synced tabs, dark-mode, etc.
