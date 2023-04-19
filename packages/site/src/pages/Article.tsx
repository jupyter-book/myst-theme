import { ReferencesProvider } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import { ThebeSessionProvider } from 'thebe-react';

export function ArticlePage({ article }: { article: PageLoader }) {
  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.design ?? {};

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <ThebeSessionProvider start>
        {!hide_title_block && (
          <FrontmatterBlock kind={article.kind} frontmatter={article.frontmatter} />
        )}
        <ContentBlocks mdast={article.mdast} />
        <Bibliography />
        {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
      </ThebeSessionProvider>
    </ReferencesProvider>
  );
}

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
