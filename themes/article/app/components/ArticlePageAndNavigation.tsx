import { GridSystemProvider, TabStateProvider, UiStateProvider } from '@myst-theme/providers';

export function ArticlePageAndNavigation({ children }: { children: React.ReactNode }) {
  return (
    <UiStateProvider>
      <TabStateProvider>
        <GridSystemProvider gridSystem="article-left-grid">
          <article className="article content article-left-grid subgrid-gap">{children}</article>
        </GridSystemProvider>
      </TabStateProvider>
    </UiStateProvider>
  );
}
