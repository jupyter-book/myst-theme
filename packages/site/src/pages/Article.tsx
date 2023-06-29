import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import { ThebeRenderMimeRegistryProvider, ThebeSessionProvider } from 'thebe-react';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import { EnableCompute } from '../components/EnableCompute';
import { NotebookRunAll } from '../components/ComputeControls';
import {
  NotebookProvider,
  BinderBadge,
  useComputeOptions,
  ConnectionStatusTray,
} from '@myst-theme/jupyter';
import { NotebookProvider, BinderBadge, useComputeOptions } from '@myst-theme/jupyter';
import { ExecuteScopeProvider, useExecuteScope } from './executeScope';

function Scope({ slug }: { slug: string }) {
  const { scope } = useExecuteScope();

  const { article, ...rest } = scope.items[slug] ?? {};
  return (
    <div className="relative group/scope">
      <div className="px-1 text-xs text-center text-white rounded-md bg-neutral-500">scope</div>
      <div className="max-w-[900px] max-h-[600px] overflow-auto absolute top-0 right-0 z-50 invisible group-hover/scope:visible border rounded bg-white p-2">
        <pre>{JSON.stringify(rest, null, 2)}</pre>
        <pre>{JSON.stringify(article, null, 2)}</pre>
      </div>
    </div>
  );
}

export const ArticlePage = React.memo(function ({ article }: { article: PageLoader }) {
  const computeOptions = useComputeOptions();
  const canCompute = computeOptions.canCompute && (article.frontmatter as any)?.thebe !== false;
  const { hide_title_block, hide_footer_links, binder } =
    (article.frontmatter as any)?.design ?? {};
  const isJupyter = article?.kind && article.kind === SourceFileKind.Notebook;
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <ExecuteScopeProvider article={article}>
        <div className="flex items-center">
          <div className="flex-grow"></div>
          {/* {binder && <BinderBadge binder={binder} />}
          {canCompute && isJupyter && (
            <EnableCompute canCompute={true} key={article.slug}>
              <NotebookRunAll />
            </EnableCompute>
          )} */}
          <Scope slug={article.slug} />
        </div>
        <ContentBlocks pageKind={article.kind} mdast={article.mdast as GenericParent} />
        <Bibliography />
        {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
      </ExecuteScopeProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
