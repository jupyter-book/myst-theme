import { ReferencesProvider } from '@curvenote/ui-providers';
import { Bibliography, ContentBlocks, FooterLinksBlock, FrontmatterBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';

export function ArticlePage({ article }: { article: PageLoader }) {
  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.design ?? {};
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      {!hide_title_block && (
        <FrontmatterBlock kind={article.kind} frontmatter={article.frontmatter} />
      )}
      <ContentBlocks mdast={article.mdast} />
      <Bibliography />
      {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
    </ReferencesProvider>
  );
}

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
