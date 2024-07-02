import type { Code, InlineCode } from 'myst-spec';
import type { NodeRenderer } from '@myst-theme/providers';
import { useTheme } from '@myst-theme/providers';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import light from 'react-syntax-highlighter/dist/esm/styles/hljs/xcode.js';
import dark from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015.js';
import { DocumentIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { CopyIcon } from './components/index.js';
import { MyST } from './MyST.js';

type Props = {
  value: string;
  identifier?: string;
  lang?: string;
  showCopy?: boolean;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  emphasizeLines?: number[];
  filename?: string;
  shadow?: boolean;
  background?: boolean;
  border?: boolean;
  className?: string;
};

function normalizeLanguage(lang?: string): string | undefined {
  switch (lang) {
    case 'html':
      return 'xml';
    default:
      return lang;
  }
}

export function CodeBlock(props: Props) {
  const { isLight } = useTheme();
  const {
    value,
    lang,
    identifier,
    emphasizeLines,
    showLineNumbers,
    className,
    showCopy = true,
    startingLineNumber = 1,
    filename,
    shadow,
    background,
    border,
  } = props;
  const highlightLines = new Set(emphasizeLines);
  return (
    <div
      id={identifier}
      className={classNames('relative group not-prose overflow-auto', className, {
        'shadow hover:shadow-md dark:shadow-2xl dark:shadow-neutral-900 my-5 text-sm': shadow,
        'bg-stone-200/10': background,
        'border border-l-4 border-l-blue-400 border-gray-200 dark:border-l-blue-400 dark:border-gray-800':
          border,
      })}
    >
      {filename && (
        <div className="flex flex-row pl-2 bg-white border-b dark:bg-slate-600 dark:border-slate-300">
          <DocumentIcon
            width="16px"
            height="16px"
            className="self-center flex-none inline-block text-gray-500 dark:text-gray-100"
          />
          <div className="self-center p-2 text-sm leading-3 prose text-slate-600 dark:text-white">
            {filename}
          </div>
        </div>
      )}
      <SyntaxHighlighter
        language={normalizeLanguage(lang)}
        startingLineNumber={startingLineNumber}
        showLineNumbers={showLineNumbers}
        style={isLight ? { ...light, hljs: { ...light.hljs, background: 'transparent' } } : dark}
        wrapLines
        lineNumberContainerStyle={{
          // This stops page content shifts
          display: 'inline-block',
          float: 'left',
          minWidth: '1.25em',
          paddingRight: '1em',
          textAlign: 'right',
          userSelect: 'none',
          borderLeft: '4px solid transparent',
        }}
        lineProps={(line) => {
          if (typeof line === 'boolean') return {};
          return highlightLines.has(line)
            ? ({
                'data-line-number': `${line}`,
                'data-highlight': 'true',
              } as any)
            : ({ 'data-line-number': `${line}` } as any);
        }}
        customStyle={{ padding: '0.8rem' }}
      >
        {value}
      </SyntaxHighlighter>
      {showCopy && (
        <CopyIcon
          text={value}
          className={classNames('absolute right-1', { 'top-[32px]': filename, 'top-1': !filename })}
        />
      )}
    </div>
  );
}

const code: NodeRenderer<Code & { executable: boolean }> = ({ node }) => {
  return (
    <CodeBlock
      identifier={node.html_id}
      // data-cell-id={node.executable ? parentId : undefined}
      data-mdast-node-type={node.type}
      data-mdast-node-id={node.key}
      value={node.value || ''}
      lang={node.lang}
      filename={node.filename}
      emphasizeLines={node.emphasizeLines}
      showLineNumbers={node.showLineNumbers}
      startingLineNumber={node.startingLineNumber}
      shadow
      border={node.executable}
      background={!node.executable}
      className={classNames({ hidden: node.visibility === 'remove' }, node.class)}
    />
  );
};

function isColor(maybeColorHash: string): string | undefined {
  if (!maybeColorHash || maybeColorHash.length > 9) return undefined;
  if (!new Set([4, 7, 9]).has(maybeColorHash.length)) return undefined;
  const match = /^#([0-9A-Fa-f]{3,8})$/.exec(maybeColorHash);
  if (!match) return undefined;
  const color = match[1];
  return color;
}

const inlineCode: NodeRenderer<InlineCode> = ({ node }) => {
  if (isColor(node.value)) {
    return (
      <code className="px-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
        {node.value}
        <span
          style={{ backgroundColor: node.value }}
          className="inline-block w-[10px] h-[10px] rounded-full ml-1"
        ></span>
      </code>
    );
  }
  if (node.children && node.children.length > 0) {
    // The inline code can potentially have children
    return (
      <code>
        <MyST ast={node.children} />
      </code>
    );
  }
  return <code>{node.value}</code>;
};

const CODE_RENDERERS = {
  code,
  inlineCode,
};

export default CODE_RENDERERS;
