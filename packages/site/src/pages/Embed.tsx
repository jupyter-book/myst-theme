import React, { useEffect, useMemo, useState } from 'react';
import { MyST } from 'myst-to-react';
import { selectMdastNodes, type GenericNode, type GenericParent, type References } from 'myst-common';
import { ArticleProvider, TabStateProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';
import { SourceFileKind } from 'myst-spec-ext';
import type { PageLoader } from '@myst-theme/common';

type XRefEntry = {
  identifier?: string;
  key?: string;
  id?: string;
  html_id?: string;
  data?: string;
  source?: string;
  url?: string;
  kind?: string;
  role?: string;
};

type ComponentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'mdast';
      nodes: GenericNode[];
      references?: References;
      frontmatter?: PageLoader['frontmatter'];
      kind?: SourceFileKind;
    }
  | { status: 'html'; html: string };

function normalizeId(id?: string | null) {
  if (!id) return undefined;
  return id.replace(/^#/, '');
}

function normalizePath(path?: string, baseurl?: string) {
  if (!path) return undefined;
  const cleaned = path.replace(/[#?].*$/, '').replace(/^\/+/, '');
  if (baseurl && cleaned.startsWith(baseurl)) {
    return cleaned.slice(baseurl.length) || '';
  }
  return cleaned || '';
}

function matchReference(ref: XRefEntry, target: string, targetUrl?: string, baseurl?: string) {
  const cleanTarget = normalizeId(target);
  const cleanUrlTarget = normalizePath(targetUrl, baseurl);
  const candidateUrl = normalizePath(ref.url, baseurl);
  const candidates = [
    ref.identifier,
    ref.key,
    ref.id,
    ref.html_id,
    ref.url,
    ref.data,
    ref.source,
  ]
    .map((value) => normalizeId(value))
    .filter(Boolean) as string[];
  const idMatches = cleanTarget ? candidates.includes(cleanTarget) : true;
  if (!cleanUrlTarget) return idMatches;
  // Require URL match; if an id was provided, require both.
  const urlMatches = candidateUrl === cleanUrlTarget;
  return cleanTarget ? idMatches && urlMatches : urlMatches;
}

function resolveSource(ref: XRefEntry) {
  return ref.source || ref.data || ref.url;
}

function joinUrl(part?: string, baseurl?: string) {
  if (!part) return undefined;
  if (/^https?:\/\//i.test(part)) return part;
  if (baseurl) {
    const trimmed = part.replace(/^\/+/, '');
    return `${baseurl}/${trimmed}`;
  }
  return part;
}

function getMdastPayload(data: any): GenericParent | undefined {
  if (!data) return undefined;
  if ('mdast' in data && data.mdast) return data.mdast as GenericParent;
  if ('article' in data && data.article?.mdast) return data.article.mdast as GenericParent;
  if ('content' in data && data.content?.mdast) return data.content.mdast as GenericParent;
  return undefined;
}

function getFrontmatter(data: any): PageLoader['frontmatter'] | undefined {
  if (!data) return undefined;
  if ('frontmatter' in data && data.frontmatter) return data.frontmatter as PageLoader['frontmatter'];
  if ('article' in data && data.article?.frontmatter) {
    return data.article.frontmatter as PageLoader['frontmatter'];
  }
  if ('content' in data && data.content?.frontmatter) {
    return data.content.frontmatter as PageLoader['frontmatter'];
  }
  return undefined;
}

function getKind(data: any): SourceFileKind | undefined {
  if (!data) return undefined;
  const kind: SourceFileKind | undefined = data.kind ?? data.article?.kind ?? data.content?.kind;
  return kind;
}

function getReferences(data: any): References | undefined {
  if (!data) return undefined;
  if ('references' in data && data.references) return data.references as References;
  if ('article' in data && data.article?.references) {
    return data.article.references as References;
  }
  if ('content' in data && data.content?.references) {
    return data.content.references as References;
  }
  return undefined;
}

export function Embed() {
  const baseurl = useBaseurl();
  const [componentId, setComponentId] = useState<string | undefined>(undefined);
  const [componentUrl, setComponentUrl] = useState<string | undefined>(undefined);
  const [state, setState] = useState<ComponentState>({ status: 'loading' });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const url =
      search.get('p') ??
      search.get('page') ??
      search.get('url') ??
      search.get('href')?.replace(/^\/+/, '');
    const id = search.get('id') ?? search.get('component') ?? search.get('ref') ?? search.get('key');
    if (!url) {
      setState({
        status: 'error',
        message: 'Embed requires ?p=<page url>. Optionally add &id=<component id>.',
      });
      return;
    }
    setComponentUrl(url);
    setComponentId(id ?? undefined);
  }, []);

  useEffect(() => {
    if (!componentUrl) return;
    let cancelled = false;
    async function run() {
      try {
        const xrefUrl = withBaseurl('/myst.xref.json', baseurl);
        const xrefResponse = await fetch(xrefUrl);
        if (!xrefResponse.ok) {
          throw new Error(`Unable to load myst.xref.json (${xrefResponse.status}).`);
        }
        const xref = await xrefResponse.json();
        const references: XRefEntry[] = xref?.references ?? [];
        const ref =
          references.find(
            (candidate) =>
              (candidate.role === 'component' || candidate.kind === 'component') &&
              matchReference(candidate, componentId ?? '', componentUrl, baseurl),
          ) ??
          references.find((candidate) => matchReference(candidate, componentId ?? '', componentUrl, baseurl));
        if (!ref && componentId) {
          throw new Error(
            `Component "${componentId}" with url "${componentUrl}" not found in myst.xref.json.`,
          );
        }
        const effectiveRef =
          ref ??
          references.find((candidate) => matchReference(candidate, '', componentUrl, baseurl));
        if (!effectiveRef && componentId) {
          throw new Error(
            `Component "${componentId}" with url "${componentUrl}" not found in myst.xref.json.`,
          );
        }
        let sourcePath = effectiveRef ? resolveSource(effectiveRef) : undefined;
        if (!sourcePath) {
          // Fallback to the requested page URL when no explicit source is provided.
          sourcePath = componentUrl;
        }
        if (!sourcePath) {
          throw new Error(
            `Component "${componentId ?? 'page'}" is missing a source location in myst.xref.json.`,
          );
        }
        const targetUrl = joinUrl(sourcePath, baseurl);
        if (!targetUrl) {
          throw new Error(`Unable to resolve component source for "${componentId}".`);
        }
        const targetIdentifier = effectiveRef
          ? normalizeId(effectiveRef.identifier) ??
            normalizeId(effectiveRef.key) ??
            normalizeId(effectiveRef.id) ??
            normalizeId(effectiveRef.html_id)
          : normalizeId(componentId) ??
            '';
        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`Failed to load component source (${response.status}).`);
        }
        const text = await response.text();
        let parsed: any | undefined;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          // If parsing fails, fallback to plain HTML/text rendering.
        }
        if (parsed) {
          const mdast = getMdastPayload(parsed);
          if (mdast) {
            if (!componentId) {
              if (cancelled) return;
              setState({
                status: 'mdast',
                nodes: mdast.children ?? [mdast],
                references: getReferences(parsed),
                frontmatter: getFrontmatter(parsed),
                kind: getKind(parsed) ?? SourceFileKind.Article,
              });
              return;
            }
            const selected = selectMdastNodes(mdast, targetIdentifier ?? '', undefined);
            if ((selected.nodes?.length ?? 0) > 0) {
              if (cancelled) return;
              setState({
                status: 'mdast',
                nodes: selected.nodes,
                references: getReferences(parsed),
                frontmatter: getFrontmatter(parsed),
                kind: getKind(parsed) ?? SourceFileKind.Article,
              });
              return;
            }
          }
          if (typeof parsed.source === 'string') {
            if (cancelled) return;
            setState({ status: 'html', html: parsed.source });
            return;
          }
        }
        if (cancelled) return;
        setState({ status: 'html', html: text });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to render component.',
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [baseurl, componentId, componentUrl]);

  const content = useMemo(() => {
    if (state.status === 'loading') {
      return <p className="text-center text-slate-600 dark:text-slate-300">Loading component…</p>;
    }
    if (state.status === 'error') {
      return (
        <p className="text-center text-red-700 dark:text-red-300">
          {state.message ?? 'Unable to render component.'}
        </p>
      );
    }
    if (state.status === 'mdast') {
      return (
        <TabStateProvider>
          <ArticleProvider
            kind={state.kind ?? SourceFileKind.Article}
            frontmatter={state.frontmatter}
            references={state.references}
          >
            <article className="article content">
              <MyST ast={state.nodes} />
            </article>
          </ArticleProvider>
        </TabStateProvider>
      );
    }
    return (
      <div
        className="article content"
        dangerouslySetInnerHTML={{ __html: state.html || 'No component content found.' }}
      />
    );
  }, [state]);

  return (
    <main className="min-h-screen w-full bg-white dark:bg-stone-900 text-slate-900 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">{content}</div>
    </main>
  );
}
