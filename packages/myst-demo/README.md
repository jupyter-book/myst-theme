# myst-demo

[![myst-demo on npm](https://img.shields.io/npm/v/myst-demo.svg)](https://www.npmjs.com/package/myst-demo)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/curvenote/curvenote/blob/main/LICENSE)

A demo component for MyST Markdown, for example, [in the sanbox](https://myst.tools/sandbox).

![](/images/sandbox.png)

```jsx
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { TabStateProvider, UiStateProvider } from '@myst-theme/providers';
import { MySTRenderer } from 'myst-demo';

function MySTSandbox({ value }: { value: string }) {
  return (
    <TabStateProvider>
      <UiStateProvider>
        <main ref={ref} className="article p-0">
          <MySTRenderer
            value={value}
            column
            fullscreen
            captureTab
            className="h-[calc(100vh-60px)]"
            TitleBlock={FrontmatterBlock}
          />
        </main>
      </UiStateProvider>
    </TabStateProvider>
  );
}
```
