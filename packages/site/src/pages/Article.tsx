import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
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
import { useComputeOptions } from '@myst-theme/jupyter';
import { useExecuteScope } from './execute/hooks';
import {
  selectIsComputable,
  selectAreExecutionScopesReady,
  selectAreExecutionScopesBuilding,
  selectExecutionScopeStatus,
} from './execute/selectors';
import { ExecuteScopeProvider } from './execute/provider';

function Scope({ slug }: { slug: string }) {
  const { store } = useExecuteScope();

  const keys = Object.keys(store.mdast);
  return (
    <div className="relative group/scope">
      <div className="px-1 text-xs text-center text-white rounded-md bg-neutral-500">scope</div>
      <div className="w-max max-w-[900px] max-h-[600px] overflow-auto absolute top-0 right-0 z-50 invisible group-hover/scope:visible border rounded bg-white p-2">
        <div>current slug: {slug}</div>
        <div>mdast keys: {keys.join(', ')}</div>
        <pre>{JSON.stringify(store.builds, null, 2)}</pre>
        <pre>{JSON.stringify(store.renderings, null, 2)}</pre>
      </div>
    </div>
  );
}

function Computable({ slug }: { slug: string }) {
  const { store, start, restart } = useExecuteScope();
  const computable = selectIsComputable(slug, store);
  const handleStart = () => start(slug);
  const handleRestart = () => restart(slug);

  const started = selectAreExecutionScopesReady(slug, store);
  const building = selectAreExecutionScopesBuilding(slug, store);
  const status = selectExecutionScopeStatus(slug, store);
  const idle = !started && !building;

  if (computable)
    return (
      <div className="flex space-x-1">
        <div className="px-2 text-xs text-white bg-green-500 rounded-md">computable</div>
        {idle && (
          <button
            className="px-2 text-xs text-green-500 border border-green-500 rounded"
            onClick={handleStart}
            aria-label="start compute environment"
          >
            start
          </button>
        )}
        {building && (
          <div className="px-2 text-xs text-white bg-yellow-500 rounded-md">{status}</div>
        )}
        {started && (
          <button
            className="px-2 text-xs text-red-500 border border-red-500 rounded"
            onClick={handleRestart}
            aria-label="restart the current compute session"
          >
            restart
          </button>
        )}
      </div>
    );
  return null;
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
        <div className="flex flex-col items-end my-1 space-y-1">
          {/* {binder && <BinderBadge binder={binder} />}
          {canCompute && isJupyter && (
            <EnableCompute canCompute={true} key={article.slug}>
              <NotebookRunAll />
            </EnableCompute>
          )} */}
          <Scope slug={article.slug} />
          <Computable slug={article.slug} />
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
