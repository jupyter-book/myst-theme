import { Details, MyST } from 'myst-to-react';
import { SourceFileKind, Heading } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import {
  NotebookClearCell,
  NotebookRunCell,
  NotebookRunCellSpinnerOnly,
} from '@myst-theme/jupyter';
import { select, selectAll } from 'unist-util-select';
import { filter } from 'unist-util-filter';
import { useGridSystemProvider } from '@myst-theme/providers';
import { isACodeCell } from '../utils.js';
import { walkOutputs } from 'nbtx';

function parse_header(mdast: GenericParent): {
  subtitle: GenericParent | undefined;
  heading: GenericParent | undefined;
  body: GenericParent;
} {
  let heading, subtitle, i;
  for (i = 0; i < mdast.children.length; i++) {
    const node = mdast.children[i];
    if (node.type === 'paragraph') {
      subtitle = node;
    } else if (node.type === 'heading') {
      heading = node;
      break;
    }
  }
  if (heading) {
    const body = { type: 'block', children: mdast.children.slice(i + 1) };
    return { subtitle: subtitle as any, heading: heading as any, body: body as any };
  } else {
    return {
      subtitle: undefined,
      heading: undefined,
      body: { type: 'block', children: mdast.children as any },
    };
  }
}

function BlockChild({ node }: { node: GenericParent }) {
  const block = node.data?.block as string | undefined;
  if (block === undefined) {
    return <MyST ast={node.children} />;
  }
  switch (block) {
    case 'split-image': {
      return <SplitImageCTA node={node} />;
    }
    case 'justified': {
      return <Justified node={node} />;
    }
    case 'logo-cloud': {
      return <LogoCloud node={node} />;
    }
    default: {
      return <UnknownBlock node={node} blockName={block} />;
    }
  }
}

function InvalidBlock({ node, blockName }: { node: GenericParent; blockName: string }) {
  return (
    <div className="relative" role="alert">
      <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
        Invalid block <span className="font-mono">{blockName}</span>
      </div>
      <div className="border border-t-0 border-red-400 rounded-b ">
        <div className="bg-red-100 text-red-700 px-4 py-3">
          <p>This '{blockName}' block does not conform to the expected AST structure.</p>
        </div>

        <div className="px-4 py-3">
          <MyST ast={node} />
        </div>
      </div>
    </div>
  );
}

function UnknownBlock({ node, blockName }: { node: GenericParent; blockName: string }) {
  return (
    <div className="relative" role="alert">
      <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
        Unknown block <span className="font-mono">{blockName}</span>
      </div>
      <div className="border border-t-0 border-red-400 rounded-b px-4 py-3">
        <MyST ast={node} />
      </div>
    </div>
  );
}

function SplitImageCTA({ node }: { node: GenericParent }) {
  const { subtitle, heading, body: rawBody } = parse_header(node);
  const body = filter(
    rawBody,
    (otherNode: any) => !['link', 'crossReference', 'image'].includes(otherNode.type),
  );
  const links = selectAll('link,crossReference', rawBody);
  const image = select('image', rawBody);
  if (!image || !body) {
    return <InvalidBlock node={node} blockName="split-image" />;
  }
  // TODO: set heading depth
  //
  return (
    <div className="relative bg-gray-900 text-white rounded-md">
      <div className="lg:absolute lg:h-full lg:w-[calc(50%)] h-80 relative [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:m-0 [&_picture]:m-0 [&_picture]:inline">
        <MyST ast={image} />
      </div>
      <div className="relative py-24">
        <div className="lg:ml-auto lg:w-[calc(50%)] lg:p-8 px-6 lg:pl-24">
          {subtitle && (
            <p className="font-semibold text-indigo-400 uppercase my-0">
              <MyST ast={subtitle.children} />
            </p>
          )}
          {heading && (
            <h2 className="text-5xl text-white font-semibold tracking-tight mt-2 mb-0">
              <MyST ast={heading.children} />
            </h2>
          )}
          <div className="mt-6 text-gray-300">
            <MyST ast={body} />
          </div>
          {links && (
            <div className="mt-8 flex gap-4 items-center">
              <MyST ast={links} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// block:24, sm:block:32, lg:inline:8
function Justified({ node }: { node: GenericParent }) {
  const headerNode = select('heading', node) as GenericParent | null;
  if (!headerNode) {
    return <InvalidBlock node={node} blockName="justified" />;
  }
  const links = selectAll('link,crossReference', node);
  return (
    <div className="relative">
      <div className="py-20 sm:py-28 lg:px-8 lg:flex lg:content-center lg:justify-between">
        {' '}
        <h2 className="text-5xl font-semibold tracking-tight my-0">
          <MyST ast={headerNode.children} />
        </h2>
        {links && (
          <div className="mt-8 flex gap-4 items-center">
            <MyST ast={links} />
          </div>
        )}
      </div>
    </div>
  );
}

function LogoCloud({ node }: { node: GenericParent }) {
  const grid = select('grid', node);
  if (!grid) {
    return <InvalidBlock node={node} blockName="logo-cloud" />;
  }
  const rawBody = filter(node, (child) => child.type !== 'grid')!;
  const body = filter(
    rawBody,
    (child) => child.type !== 'link' && child.type !== 'crossReference',
  )!;
  const links = selectAll('link,crossReference', rawBody);

  return (
    <div className="text-center py-20 sm:py-28">
      <div className="font-semibold text-gray-900">
        <MyST ast={body} />
      </div>
      {grid && <MyST ast={grid} />}
      {links && (
        <div className="mt-8 flex gap-4 items-center justify-center">
          <MyST ast={links} />
        </div>
      )}
    </div>
  );
}

export function Block({
  id,
  pageKind,
  node,
  className,
}: {
  id: string;
  pageKind: SourceFileKind;
  node: GenericParent;
  className?: string;
}) {
  const grid = useGridSystemProvider();
  const subGrid = node.visibility === 'hide' ? '' : `${grid} subgrid-gap col-screen`;
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));

  const block = (
    <div
      key={`block-${id}`}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        [subGrid]: !noSubGrid,
        hidden: node.visibility === 'remove',
      })}
    >
      {pageKind === SourceFileKind.Notebook && isACodeCell(node) && (
        <>
          <div className="flex sticky top-[80px] z-10 opacity-70 group-hover/block:opacity-100 group-hover/block:hidden">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <NotebookRunCellSpinnerOnly id={id} />
            </div>
          </div>
          <div className="hidden sticky top-[80px] z-10 opacity-70 group-hover/block:opacity-100 group-hover/block:flex">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <NotebookRunCell id={id} />
              <NotebookClearCell id={id} />
            </div>
          </div>
        </>
      )}
      <BlockChild node={node} />
    </div>
  );
  if (node.visibility === 'hide') {
    return <Details title="Notebook Cell">{block}</Details>;
  }
  return block;
}

export function ContentBlocks({
  mdast,
  pageKind = SourceFileKind.Article,
  className,
}: {
  mdast: GenericParent;
  pageKind?: SourceFileKind;
  className?: string;
}) {
  if (!mdast) return null;
  const blocks = mdast.children as GenericParent[];
  return (
    <>
      {blocks
        .filter((node) => node.visibility !== 'remove')
        .map((node) => (
          <Block
            key={node.key}
            id={node.key}
            pageKind={pageKind}
            node={node}
            className={className}
          />
        ))}
    </>
  );
}
