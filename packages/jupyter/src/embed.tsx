import { SourceFileKind, type GenericNode } from 'myst-common';
import { useCellExecution } from './execute';
import {
  ArticleResetNotebook,
  ArticleRunNotebook,
  ArticleStatusBadge,
} from './controls/ArticleCellControls';
import { JupyterIcon } from '@scienceicons/react/24/solid';
import { select } from 'unist-util-select';
import { useLinkProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';

function EmbedWithControls({
  outputKey,
  children,
  title = 'Jupyter Notebook',
  url,
}: {
  outputKey: string;
  children?: React.ReactNode;
  title?: string;
  url?: string;
}) {
  const { canCompute, kind } = useCellExecution(outputKey);
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const showComputeControls = canCompute && kind === SourceFileKind.Article;

  if (showComputeControls) {
    return (
      <div className="shadow">
        <div className="sticky top-[60px] z-[2] w-full bg-gray-100/80 backdrop-blur dark:bg-neutral-800/80 py-1 px-2">
          <div className="flex items-center">
            <div className="flex items-center">
              <JupyterIcon className="inline-block w-5 h-5" />
              <span className="ml-2">Source:</span>
              {url && (
                <Link
                  to={withBaseurl(url, baseurl)}
                  className="ml-2 no-underline text-normal hover:underline"
                >
                  {title}
                </Link>
              )}
            </div>
            <div className="flex-grow" />
            <ArticleStatusBadge id={outputKey} />
            <ArticleRunNotebook id={outputKey} />
            <ArticleResetNotebook id={outputKey} />
          </div>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    );
  }

  // light
  return (
    <div className="z-[2] w-full backdrop-blur py-1 px-2">
      <div className="mt-2">{children}</div>
      <div className="flex items-center justify-end text-xs">
        <JupyterIcon className="inline-block w-3 h-3" />
        <div className="ml-1">Source:</div>
        {url && (
          <Link
            to={withBaseurl(url, baseurl)}
            className="ml-1 no-underline text-normal hover:underline"
          >
            {title}
          </Link>
        )}
      </div>
    </div>
  );
}

export function Embed(node: GenericNode, children: React.ReactNode) {
  const output = select('output', node) as GenericNode;
  if (!output) return <>{children}</>;
  return (
    <EmbedWithControls
      key={node.key}
      outputKey={output.key}
      title={node.source?.title}
      url={node.source?.url}
    >
      {children}
    </EmbedWithControls>
  );
}
