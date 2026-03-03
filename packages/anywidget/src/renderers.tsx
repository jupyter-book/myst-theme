/**
 * Upstreamed from https://github.com/curvenote/curvenote/tree/main/packages/any-widget
 * Orginally forked from https://github.com/manzt/anymyst/commit/d0b2c105397f5b1a0344b4b467c3790c498a84c6
 *
 * A custom renderer for Myst to support anywidget front-end modules
 * @module
 *
 * @example
 * ```
 * <Document renderers={{ ...renderers, anywidget:  AnyMystRenderer }}></Document>
 * ```
 */
import * as React from 'react';
import classNames from 'classnames';
import type { AnyWidget } from './types.js';
import { MystAnyModel } from './models.js';

export function AnyWidgetRenderer({ node }: { node: AnyWidget }) {
  // basic validation
  const esmModuleUrl = node.esm;
  const isESMModuleUrlValid =
    esmModuleUrl &&
    typeof esmModuleUrl === 'string' &&
    (esmModuleUrl.startsWith('https://') || esmModuleUrl.startsWith('http://'));
  const validModel = node.model && typeof node.model === 'object';

  const ref = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<Error | null>(null);
  React.useEffect(() => {
    // Reset error state on node change
    setError(null);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal#implementing_an_abortable_api
    const controller = new AbortController();

    // If already aborted just ignore
    if (controller.signal.aborted) {
      return;
    }

    let maybeCleanupInitialize: undefined | (() => void | Promise<void>) = undefined;
    let maybeCleanupRender: undefined | (() => void | Promise<void>) = undefined;

    controller.signal.addEventListener('abort', async () => {
      await maybeCleanupRender?.();
      await maybeCleanupInitialize?.();
    });

    const useShadowDom = true;

    // TODO: validation for import & styles URLs
    console.debug('AnyRenderer importing:', esmModuleUrl);
    import(esmModuleUrl)
      .then(async (mod) => {
        const rootEl = ref.current;
        if (!rootEl) return;
        console.debug('AnyRenderer imported', mod);
        const widget = mod.default;

        // TODO: validate the widget
        const model = new MystAnyModel(node.model);
        maybeCleanupInitialize = await widget.initialize?.({ model });

        // Apply container classes
        rootEl.className = classNames('myst-anywidget', node.class);

        // Either use the DOM or shadow DOM for the root
        let widgetRoot: HTMLDivElement;
        if (useShadowDom) {
          const shadowRoot = rootEl.shadowRoot ?? rootEl.attachShadow({ mode: 'open' });
          // Create node to render the widget
          widgetRoot = document.createElement('div');
          shadowRoot.replaceChildren(widgetRoot);
        } else {
          widgetRoot = rootEl;
        }
        // Always apply styles as child of widget root
        if (node.css) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = node.css;
          widgetRoot.appendChild(link);
        }

        maybeCleanupRender = await widget.render?.({
          model,
          el: widgetRoot,
        });
      })
      .catch((err) => {
        console.error('AnyRenderer failed to import module:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => {
      controller?.abort();
    };
  }, [node]);

  if (error) {
    return (
      <details className="p-3 bg-gray-100 rounded border border-gray-300 cursor-pointer">
        <summary className="text-sm text-gray-600 select-none">
          Failed to load <code className="text-xs">anywidget</code> module.
        </summary>
        <div className="pt-2 mt-2 space-y-1 text-xs border-t border-gray-200">
          <div className="text-gray-500">
            <span className="font-medium">Widget Module URL:</span> {esmModuleUrl}
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Error:</span> {error.message}
          </div>
          <div className="text-gray-700">
            <span className="font-medium">Stack:</span> {error.stack}
          </div>
        </div>
      </details>
    );
  }

  if (!isESMModuleUrlValid || !validModel) {
    return (
      <div className="p-3 space-y-2 rounded-md border border-red-500">
        <div>
          Invalid <code>anywidget</code> directive.
        </div>
        {!isESMModuleUrlValid && (
          <div className="px-1">
            <div>Invalid import URL</div>
            <div className="text-sm text-gray-500">{node.esm}</div>
          </div>
        )}
        {!validModel && (
          <div className="px-1">
            <div>Invalid JSON data</div>
            <div className="text-sm text-gray-500">{(node.model as any)?.toString()}</div>
          </div>
        )}
      </div>
    );
  }

  return <div className="relative w-full" ref={ref} />;
}
