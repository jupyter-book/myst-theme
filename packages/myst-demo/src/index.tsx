import { VFile } from 'vfile';
import type { LatexResult } from 'myst-to-tex'; // Only import the type!!
import type { TypstResult } from 'myst-to-typst'; // Only import the type!!
import { remove } from 'unist-util-remove';
import type { VFileMessage } from 'vfile-message';
import yaml from 'js-yaml';
import {
  fileError,
  RuleId,
  type GenericNode,
  type GenericParent,
  type References,
} from 'myst-common';
import type { Code } from 'myst-spec';
import { SourceFileKind } from 'myst-spec-ext';
import type { DocxResult } from 'myst-to-docx';
import { validatePageFrontmatter } from 'myst-frontmatter';
import type { PageFrontmatter } from 'myst-frontmatter';
import type { NodeRenderer } from '@myst-theme/providers';
import { ReferencesProvider } from '@myst-theme/providers';
import { CopyIcon, CodeBlock, MyST } from 'myst-to-react';
import { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

function downloadBlob(filename: string, blob: Blob) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
}

async function saveDocxFile(filename: string, mdast: any) {
  const { unified } = await import('unified');
  const { mystToDocx, fetchImagesAsBuffers } = await import('myst-to-docx');
  // Clone the tree
  const tree = JSON.parse(JSON.stringify(mdast));
  const opts = await fetchImagesAsBuffers(tree);
  const docxBlob = await (unified()
    .use(mystToDocx, opts)
    .stringify(tree as any).result as DocxResult);
  downloadBlob(filename, docxBlob as Blob);
}

/**
 * Simpler function than getFrontmatter from myst-transforms
 *
 * This only strips frontmatter yaml; it does nothing with headings
 */
function getFrontmatter(vfile: VFile, tree: GenericParent) {
  const firstParent = tree.children[0]?.type === 'block' ? tree.children[0] : tree;
  const firstNode = firstParent.children?.[0] as Code;
  let frontmatter: Record<string, any> = {};
  const firstIsYaml = firstNode?.type === 'code' && firstNode?.lang === 'yaml';
  if (firstIsYaml) {
    try {
      frontmatter = (yaml.load(firstNode.value) as Record<string, any>) || {};
      (firstNode as any).type = '__delete__';
    } catch (err) {
      fileError(vfile, 'Invalid YAML frontmatter', {
        note: (err as Error).message,
        ruleId: RuleId.frontmatterIsYaml,
      });
    }
  }
  // Handles deleting the block if it is the only element in the block
  const possibleNull = remove(tree, '__delete__');
  if (possibleNull === null) {
    // null is returned if tree itself didn’t pass the test or is cascaded away
    remove(tree, { cascade: false }, '__delete__');
  }
  return frontmatter;
}

async function parse(
  text: string,
  defaultFrontmatter?: PageFrontmatter,
  options?: {
    renderers?: Record<string, NodeRenderer>;
    removeHeading?: boolean;
    jats?: { fullArticle?: boolean };
  },
) {
  // Ensure that any imports from myst are async and scoped to this function
  const { visit } = await import('unist-util-visit');
  const { unified } = await import('unified');
  const { mystParse } = await import('myst-parser');
  const {
    mathPlugin,
    footnotesPlugin,
    keysPlugin,
    htmlPlugin,
    reconstructHtmlPlugin,
    basicTransformationsPlugin,
    enumerateTargetsPlugin,
    resolveReferencesPlugin,
    WikiTransformer,
    GithubTransformer,
    DOITransformer,
    RRIDTransformer,
    RORTransformer,
    linksPlugin,
    ReferenceState,
    abbreviationPlugin,
    glossaryPlugin,
    joinGatesPlugin,
  } = await import('myst-transforms');
  const { default: mystToTex } = await import('myst-to-tex');
  const { default: mystToTypst } = await import('myst-to-typst');
  const { default: mystToJats } = await import('myst-to-jats').catch(() => ({ default: null }));
  const { mystToHtml } = await import('myst-to-html');
  const { cardDirective } = await import('myst-ext-card');
  const { gridDirective } = await import('myst-ext-grid');
  const { tabDirectives } = await import('myst-ext-tabs');
  const { proofDirective } = await import('myst-ext-proof');
  const { exerciseDirectives } = await import('myst-ext-exercise');
  const vfile = new VFile();
  const parseMyst = (content: string) =>
    mystParse(content, {
      markdownit: { linkify: true },
      directives: [
        cardDirective,
        gridDirective,
        ...tabDirectives,
        proofDirective,
        ...exerciseDirectives,
      ],
      // roles: [reactiveRole],
      vfile,
    });
  const mdast = parseMyst(text);
  const linkTransforms = [
    new WikiTransformer(),
    new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer(),
    new RORTransformer(),
  ];
  // For the mdast that we show, duplicate, strip positions and dump to yaml
  // Also run some of the transforms, like the links
  const mdastPre = JSON.parse(JSON.stringify(mdast));
  visit(mdastPre, (n) => delete n.position);
  const htmlString = mystToHtml(JSON.parse(JSON.stringify(mdast)));
  const references = {
    cite: { order: [], data: {} },
    footnotes: {},
  };
  const frontmatterRaw = getFrontmatter(vfile, mdast);
  const frontmatter = validatePageFrontmatter(frontmatterRaw, {
    property: 'frontmatter',
    messages: {},
  });
  const state = new ReferenceState('', {
    numbering: frontmatter.numbering ?? defaultFrontmatter?.numbering,
    vfile,
  });
  visit(mdast, (n) => {
    // Before we put in the citation render, we can mark them as errors
    if (n.type === 'cite') {
      n.error = true;
    }
  });
  unified()
    .use(reconstructHtmlPlugin) // We need to group and link the HTML first
    .use(htmlPlugin) // Some of the HTML plugins need to operate on the transformed html, e.g. figure caption transforms
    .use(basicTransformationsPlugin, { parser: parseMyst })
    .use(mathPlugin, { macros: frontmatter?.math ?? {} }) // This must happen before enumeration, as it can add labels
    .use(glossaryPlugin) // This should be before the enumerate plugins
    .use(abbreviationPlugin, { abbreviations: frontmatter.abbreviations })
    .use(enumerateTargetsPlugin, { state })
    .use(linksPlugin, { transformers: linkTransforms })
    .use(footnotesPlugin)
    .use(joinGatesPlugin)
    .use(resolveReferencesPlugin, { state })
    .use(keysPlugin)
    .runSync(mdast as any, vfile);

  const mdastPost = JSON.parse(JSON.stringify(mdast));
  visit(mdastPost, (n) => {
    delete n.position;
    delete n.key;
  });
  const texFile = new VFile();
  const tex = unified()
    .use(mystToTex, { references })
    .stringify(mdast as any, texFile).result as LatexResult;
  const typstFile = new VFile();
  let typst: TypstResult;
  try {
    typst = unified()
      .use(mystToTypst)
      .stringify(mdast as any, typstFile).result as TypstResult;
  } catch (error) {
    console.error(error);
    typst = {
      value: `Problem with typst conversion: ${(error as Error).message || 'Unknown Error'}`,
      macros: [],
      commands: {},
    };
  }
  const jatsFile = new VFile();
  const jats: any = mystToJats
    ? unified()
        .use(mystToJats, SourceFileKind.Article, frontmatter, undefined, '', {
          format: 2,
          writeFullArticle: options?.jats?.fullArticle,
        })
        .stringify(mdast as any, jatsFile).result
    : 'Problem loading myst-to-jats';

  return {
    frontmatter,
    mdastPre,
    mdastPost,
    references: { ...references, article: mdast } as References,
    html: htmlString,
    tex: tex.value,
    texWarnings: texFile.messages,
    typst: typst.value,
    typstWarnings: typstFile.messages,
    jats: jats,
    jatsWarnings: jatsFile.messages,
    warnings: vfile.messages,
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
  TitleBlock?: (props: { frontmatter: PageFrontmatter }) => JSX.Element | null;
  numbering?: any;
  className?: string;
}) {
  const area = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState<string>(value.trim());
  const [references, setReferences] = useState<References>({});
  const [frontmatter, setFrontmatter] = useState<PageFrontmatter>({});
  const [mdastPre, setMdastPre] = useState<any>('Loading...');
  const [mdastPost, setMdastPost] = useState<any>('Loading...');
  const [html, setHtml] = useState<string>('Loading...');
  const [tex, setTex] = useState<string>('Loading...');
  const [texWarnings, setTexWarnings] = useState<VFileMessage[]>([]);
  const [typst, setTypst] = useState<string>('Loading...');
  const [typstWarnings, setTypstWarnings] = useState<VFileMessage[]>([]);
  const [jats, setJats] = useState<string>('Loading...');
  const [jatsWarnings, setJatsWarnings] = useState<VFileMessage[]>([]);
  const [warnings, setWarnings] = useState<VFileMessage[]>([]);
  const [previewType, setPreviewType] = useState('DEMO');
  const [astLang, setAstLang] = useState('yaml');
  const [astStage, setAstStage] = useState('pre');

  useEffect(() => {
    const ref = { current: true };
    parse(
      text,
      { numbering },
      { removeHeading: !!TitleBlock, jats: { fullArticle: !!TitleBlock } },
    ).then((result) => {
      if (!ref.current) return;
      setFrontmatter(result.frontmatter);
      setMdastPre(result.mdastPre);
      setMdastPost(result.mdastPost);
      setReferences(result.references);
      setHtml(result.html);
      setTex(result.tex);
      setTexWarnings(result.texWarnings);
      setTypst(result.typst);
      setTypstWarnings(result.typstWarnings);
      setJats(result.jats);
      setJatsWarnings(result.jatsWarnings);
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
    case 'LaTeX':
      currentWarnings = texWarnings;
      break;
    case 'Typst':
      currentWarnings = typstWarnings;
      break;
    case 'JATS':
      currentWarnings = jatsWarnings;
      break;
    default:
      break;
  }
  const demoMenu = (
    <>
      <div className="self-center text-sm border cursor-pointer dark:border-slate-600">
        {['DEMO', 'AST', 'HTML', 'LaTeX', 'Typst', 'JATS', 'DOCX'].map((show) => (
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
      {previewType === 'AST' && (
        <div className="self-center text-sm border cursor-pointer w-fit dark:border-slate-600">
          {['yaml', 'json'].map((show) => (
            <button
              key={show}
              className={classnames('px-2 py-1', {
                'bg-white hover:bg-slate-200 dark:bg-slate-500 dark:hover:bg-slate-700':
                  astLang !== show,
                'bg-blue-800 text-white': astLang === show,
              })}
              title={`Show the AST as ${show.toUpperCase()}`}
              aria-pressed={astLang === show ? 'true' : 'false'}
              onClick={() => setAstLang(show)}
            >
              {show.toUpperCase()}
            </button>
          ))}
          {['pre', 'post'].map((show) => (
            <button
              key={show}
              className={classnames('px-2 py-1', {
                'bg-white hover:bg-slate-200 dark:bg-slate-500 dark:hover:bg-slate-700':
                  astStage !== show,
                'bg-blue-800 text-white': astStage === show,
              })}
              title={`Show the AST Stage ${show.toUpperCase()}`}
              aria-pressed={astStage === show ? 'true' : 'false'}
              onClick={() => setAstStage(show)}
            >
              {show.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </>
  );

  const mdastStage = astStage === 'pre' ? mdastPre : mdastPost;

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
        <div className="flex flex-row items-stretch h-full col-span-2 px-2 border dark:border-slate-600">
          <div className="flex-grow"></div>
          {demoMenu}
        </div>
      )}
      <div className={classnames('myst relative', { 'overflow-auto': column })}>
        <CopyIcon text={text} className="absolute right-0 p-1" />
        <label>
          <span className="sr-only">Edit the MyST Markdown text</span>
          <textarea
            ref={area}
            value={text}
            className={classnames(
              'block p-6 shadow-inner resize-none w-full font-mono bg-slate-50/50 dark:bg-slate-800/50 outline-none',
              { 'text-sm': !column },
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
        <div
          className={classnames('px-6 pb-6', {
            'pt-[40px]': !column && previewType !== 'AST',
            'pt-[80px]': !column && previewType === 'AST',
            'pt-4': column,
          })}
        >
          {previewType === 'DEMO' && (
            <>
              <ReferencesProvider references={references} frontmatter={frontmatter}>
                {TitleBlock && <TitleBlock frontmatter={frontmatter}></TitleBlock>}
                <MyST ast={references.article?.children as GenericNode[]} />
              </ReferencesProvider>
            </>
          )}
          {previewType === 'AST' && (
            <>
              <CodeBlock
                lang={astLang}
                value={
                  astLang === 'yaml' ? yaml.dump(mdastStage) : JSON.stringify(mdastStage, null, 2)
                }
              />
            </>
          )}
          {previewType === 'HTML' && <CodeBlock lang="xml" value={html} showCopy={false} />}
          {previewType === 'LaTeX' && <CodeBlock lang="latex" value={tex} showCopy={false} />}
          {previewType === 'Typst' && <CodeBlock lang="typst" value={typst} showCopy={false} />}
          {previewType === 'JATS' && <CodeBlock lang="xml" value={jats} showCopy={false} />}
          {previewType === 'DOCX' && (
            <div>
              <button
                className="p-3 border rounded"
                onClick={() => saveDocxFile('demo.docx', references.article)}
                title={`Download Micorsoft Word`}
                aria-label={`Download Micorsoft Word`}
              >
                <ArrowDownTrayIcon width="1.3rem" height="1.3rem" className="inline mr-1" />{' '}
                Download as Microsoft Word
              </button>
            </div>
          )}
        </div>
        {currentWarnings.length > 0 && (
          <div className={classnames('w-full', { 'absolute bottom-0': column })}>
            {currentWarnings.map((m, i) => (
              <div
                key={i}
                className={classnames('p-1 shadow-inner text-white not-prose', {
                  'bg-red-500 dark:bg-red-800': m.fatal === true,
                  'bg-orange-500 dark:bg-orange-700': m.fatal === false,
                  'bg-slate-500 dark:bg-slate-800': m.fatal === null,
                })}
              >
                {m.fatal === true && (
                  <ExclamationCircleIcon width="1.3rem" height="1.3rem" className="inline mr-1" />
                )}
                {m.fatal === false && (
                  <ExclamationTriangleIcon width="1.3rem" height="1.3rem" className="inline mr-1" />
                )}
                {m.fatal === null && (
                  <InformationCircleIcon width="1.3rem" height="1.3rem" className="inline mr-1" />
                )}
                <code>{m.ruleId || m.source}</code>: {m.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

export const MystDemoRenderer: NodeRenderer = ({ node }) => {
  return <MySTRenderer value={node.value} numbering={node.numbering} />;
};
