import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import {
  useComputeOptions,
  ExecuteScopeProvider,
  BusyScopeProvider,
  NotebookToolbar,
  ConnectionStatusTray,
} from '@myst-theme/jupyter';

export const ArticlePage = React.memo(function ({ article }: { article: PageLoader }) {
  const computeOptions = useComputeOptions();
  const canCompute = computeOptions.canCompute && (article.frontmatter as any)?.thebe !== false;
  const { hide_title_block, hide_footer_links, binder } =
    (article.frontmatter as any)?.design ?? {};
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider contents={article}>
          {canCompute && article.kind === SourceFileKind.Notebook && <NotebookToolbar showLaunch />}
          {canCompute && article.kind === SourceFileKind.Article && <NotebookToolbar />}
          <ContentBlocks pageKind={article.kind} mdast={article.mdast as GenericParent} />
          <Bibliography />
          <ConnectionStatusTray />
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
