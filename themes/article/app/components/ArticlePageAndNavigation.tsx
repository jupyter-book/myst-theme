import { GridSystemProvider, TabStateProvider, UiStateProvider } from '@myst-theme/providers';
import { ThemeButton } from '@myst-theme/site';

export function ArticlePageAndNavigation({ children }: { children: React.ReactNode }) {
  return (
    <UiStateProvider>
      <TabStateProvider>
        <GridSystemProvider gridSystem="article-left-grid">
          <div className="fixed top-4 right-4 z-50">
            <ThemeButton />
          </div>
          <main className="article-left-grid subgrid-gap">{children}</main>
        </GridSystemProvider>
      </TabStateProvider>
    </UiStateProvider>
  );
}
