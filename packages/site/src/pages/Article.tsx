import type { PageLoader } from '@curvenote/site-common';
import { ReferencesProvider } from '@curvenote/ui-providers';
import { Bibliography } from 'myst-to-react';
import { ContentBlocks, FooterLinksBlock, FrontmatterBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';

export function ArticlePage({ article }: { article: PageLoader }) {
  const { hide_title_block, hide_footer_links } = article.frontmatter?.design ?? {};
  return (
    <ReferencesProvider references={{ ...article.references, article: article.mdast }}>
      {!hide_title_block && (
        <FrontmatterBlock kind={article.kind} frontmatter={article.frontmatter} />
      )}
      <ContentBlocks mdast={article.mdast} />
      <Bibliography />
      {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
    </ReferencesProvider>
  );
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
