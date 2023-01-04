import { useParse } from '.';
import { VFile } from 'vfile';
import type { LatexResult } from 'myst-to-tex'; // Only import the type!!
import type { JatsResult } from 'myst-to-jats'; // Only import the type!!
import type { VFileMessage } from 'vfile-message';
import yaml from 'js-yaml';
import type { References } from 'myst-common';
import type { DocxResult } from 'myst-to-docx';
import { validatePageFrontmatter } from 'myst-frontmatter';
import type { PageFrontmatter } from 'myst-frontmatter';
import type { NodeRenderer } from './types';
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { CopyIcon } from './components/CopyIcon';
import { CodeBlock } from './code';
import { ReferencesProvider } from '@curvenote/ui-providers';

function downloadBlob(filename: string, blob: Blob) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
}

async function saveDocxFile(filename: string, mdast: any, footnotes?: any) {
  const { unified } = await import('unified');
  const { mystToDocx, fetchImagesAsBuffers } = await import('myst-to-docx');
  // Clone the tree
  const tree = JSON.parse(JSON.stringify(mdast));
  // Put the footnotes back in
  if (footnotes) tree.children.push(...Object.values(footnotes));
  const opts = await fetchImagesAsBuffers(tree);
  const docxBlob = await (unified()
    .use(mystToDocx, opts)
    .stringify(tree as any).result as DocxResult);
  downloadBlob(filename, docxBlob as Blob);
}

async function parse(text: string, defaultFrontmatter?: PageFrontmatter) {
  // Ensure that any imports from myst are async and scoped to this function
  const { visit } = await import('unist-util-visit');
  const { unified } = await import('unified');
  const { MyST } = await import('mystjs');
  const {
    mathPlugin,
    footnotesPlugin,
    keysPlugin,
    basicTransformationsPlugin,
    enumerateTargetsPlugin,
    resolveReferencesPlugin,
    WikiTransformer,
    // GithubTransformer,
    DOITransformer,
    RRIDTransformer,
    linksPlugin,
    ReferenceState,
    getFrontmatter,
  } = await import('myst-transforms');
  const { default: mystToTex } = await import('myst-to-tex');
  const { default: mystToJats } = await import('myst-to-jats');
  const myst = new MyST();
  const mdast = myst.parse(text);
  const linkTransforms = [
    new WikiTransformer(),
    // new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer(),
  ];
  // For the mdast that we show, duplicate, strip positions and dump to yaml
  // Also run some of the transforms, like the links
  const mdastPre = JSON.parse(JSON.stringify(mdast));
  unified().use(linksPlugin, { transformers: linkTransforms }).runSync(mdastPre);
  visit(mdastPre, (n) => delete n.position);
  const mdastString = yaml.dump(mdastPre);
  const htmlString = myst.renderMdast(mdastPre);
  const file = new VFile();
  const references = {
    cite: { order: [], data: {} },
    footnotes: {},
  };
  const { frontmatter: frontmatterRaw } = getFrontmatter(mdast, {
    removeYaml: true,
    removeHeading: false,
  });
  const frontmatter = validatePageFrontmatter(frontmatterRaw, {
    property: 'frontmatter',
    messages: {},
  });
  const state = new ReferenceState({
    numbering: frontmatter.numbering ?? defaultFrontmatter?.numbering,
    file,
  });
  unified()
    .use(basicTransformationsPlugin)
    .use(mathPlugin, { macros: frontmatter?.math ?? {} }) // This must happen before enumeration, as it can add labels
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin, { references })
    .use(resolveReferencesPlugin, { state })
    .use(keysPlugin)
    .runSync(mdast as any, file);
  const tex = unified()
    .use(mystToTex)
    .stringify(mdast as any).result as LatexResult;
  const jatsFile = new VFile();
  const jats = unified()
    .use(mystToJats, { spaces: 2 })
    .stringify(mdast as any, jatsFile).result as JatsResult;
  const content = useParse(mdast as any);
  return {
    frontmatter,
    yaml: mdastString,
    references: { ...references, article: mdast } as References,
    html: htmlString,
    tex: tex.value,
    jats: jats.value,
    jatsWarnings: jatsFile.messages,
    content,
    warnings: file.messages,
  };
}

export function MySTRenderer({
  value,
  column,
  fullscreen,
  numbering,
  TitleBlock,
  captureTab,
  className,
}: {
  value: string;
  column?: boolean;
  fullscreen?: boolean;
  captureTab?: boolean;
  TitleBlock?: (props: { frontmatter: PageFrontmatter }) => JSX.Element;
  numbering?: any;
  className?: string;
}) {
  const area = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState<string>(value.trim());
  const [references, setReferences] = useState<References>({});
  const [frontmatter, setFrontmatter] = useState<PageFrontmatter>({});
  const [mdastYaml, setYaml] = useState<string>('Loading...');
  const [html, setHtml] = useState<string>('Loading...');
  const [tex, setTex] = useState<string>('Loading...');
  const [jats, setJats] = useState<string>('Loading...');
  const [jatsWarnings, setJatsWarnings] = useState<VFileMessage[]>([]);
  const [warnings, setWarnings] = useState<VFileMessage[]>([]);
  const [content, setContent] = useState<React.ReactNode>(<p>{value}</p>);
  const [previewType, setPreviewType] = useState('DEMO');

  useEffect(() => {
    const ref = { current: true };
    parse(text, { numbering }).then((result) => {
      if (!ref.current) return;
      setFrontmatter(result.frontmatter);
      setYaml(result.yaml);
      setReferences(result.references);
      setHtml(result.html);
      setTex(result.tex);
      setJats(result.jats);
      setJatsWarnings(result.jatsWarnings);
      setContent(result.content);
      setWarnings(result.warnings);
    });
    return () => {
      ref.current = false;
    };
  }, [text]);

  useEffect(() => {
    if (!area.current) return;
    if (column) {
      area.current.style.height = '';
      return;
    }
    area.current.style.height = 'auto'; // for the scroll area in the next step!
    area.current.style.height = `${area.current.scrollHeight}px`;
  }, [text, column]);

  // Bit of a hack for now while still a basic text editor
  useEffect(() => {
    if (!area.current || !captureTab) return;
    area.current.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Tab') return;
      ev.preventDefault();
      ev.stopPropagation();
    });
  }, [area, captureTab]);

  let currentWarnings: VFileMessage[] = [];
  switch (previewType) {
    case 'DEMO':
      currentWarnings = warnings;
      break;
    case 'JATS':
      currentWarnings = jatsWarnings;
      break;
    default:
      break;
  }
  const demoMenu = (
    <div className="cursor-pointer text-sm self-center border dark:border-slate-600">
      {['DEMO', 'AST', 'HTML', 'LaTeX', 'JATS', 'DOCX'].map((show) => (
        <button
          key={show}
          className={classnames('px-2 py-1', {
            'bg-white hover:bg-slate-200 dark:bg-slate-500 dark:hover:bg-slate-700':
              previewType !== show,
            'bg-blue-800 text-white': previewType === show,
          })}
          title={`Show the ${show}`}
          aria-label={`Show the ${show}`}
          aria-pressed={previewType === show ? 'true' : 'false'}
          onClick={() => setPreviewType(show)}
        >
          {show}
        </button>
      ))}
    </div>
  );

  return (
    <figure
      className={classnames(
        'relative',
        {
          'grid grid-cols-2 gap-0 grid-rows-[3rem_1fr]': column,
          'shadow-lg rounded': !fullscreen,
          'm-0': fullscreen,
        },
        className,
      )}
    >
      {column && (
        <div className="col-span-2 border dark:border-slate-600 flex flex-row items-stretch h-full px-2">
          <div className="flex-grow"></div>
          {demoMenu}
        </div>
      )}
      <div className={classnames('myst relative', { 'overflow-auto': column })}>
        <div className="absolute right-0 p-1">
          <CopyIcon text={text} />
        </div>
        <label>
          <span className="sr-only">Edit the MyST Markdown text</span>
          <textarea
            ref={area}
            value={text}
            className={classnames(
              'block p-6 shadow-inner resize-none w-full font-mono bg-slate-50 dark:bg-slate-800 outline-none',
              { 'h-full': column },
            )}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </label>
      </div>
      {/* The `exclude-from-outline` class is excluded from the document outline */}
      <div
        className={classnames('exclude-from-outline relative min-h-1 dark:bg-slate-900', {
          'overflow-auto': column,
        })}
      >
        {!column && <div className="absolute top-0 left-0">{demoMenu}</div>}
        <div className={classnames('px-6 pb-6', { 'pt-[40px]': !column, 'pt-4': column })}>
          {previewType === 'DEMO' && (
            <>
              <ReferencesProvider references={references} frontmatter={frontmatter}>
                {TitleBlock && <TitleBlock frontmatter={frontmatter}></TitleBlock>}
                {content}
              </ReferencesProvider>
            </>
          )}
          {previewType === 'AST' && <CodeBlock lang="yaml" value={mdastYaml} showCopy={false} />}
          {previewType === 'HTML' && <CodeBlock lang="xml" value={html} showCopy={false} />}
          {previewType === 'LaTeX' && <CodeBlock lang="latex" value={tex} showCopy={false} />}
          {previewType === 'JATS' && <CodeBlock lang="xml" value={jats} showCopy={false} />}
          {previewType === 'DOCX' && (
            <div>
              <button
                className="rounded border p-3"
                onClick={() => saveDocxFile('demo.docx', references.article, references.footnotes)}
                title={`Download Micorsoft Word`}
                aria-label={`Download Micorsoft Word`}
              >
                <ArrowDownTrayIcon className="inline h-[1.3em] mr-1" /> Download as Microsoft Word
              </button>
            </div>
          )}
        </div>
        {currentWarnings.length > 0 && (
          <div className={classnames('w-full', { 'absolute bottom-0': column })}>
            {currentWarnings.map((m) => (
              <div
                className={classnames('p-1 shadow-inner text-white not-prose', {
                  'bg-red-500 dark:bg-red-800': m.fatal === true,
                  'bg-orange-500 dark:bg-orange-700': m.fatal === false,
                  'bg-slate-500 dark:bg-slate-800': m.fatal === null,
                })}
              >
                {m.fatal === true && <ExclamationCircleIcon className="inline h-[1.3em] mr-1" />}
                {m.fatal === false && <ExclamationTriangleIcon className="inline h-[1.3em] mr-1" />}
                {m.fatal === null && <InformationCircleIcon className="inline h-[1.3em] mr-1" />}
                <code>{m.ruleId || m.source}</code>: {m.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

const MystNodeRenderer: NodeRenderer = (node) => {
  return <MySTRenderer key={node.key} value={node.value} numbering={node.numbering} />;
};

const MYST_RENDERERS = {
  myst: MystNodeRenderer,
};

export default MYST_RENDERERS;
