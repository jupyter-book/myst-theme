import { useGridSystemProvider, useReferences } from '@myst-theme/providers';
import classNames from 'classnames';
import type { GenericNode } from 'myst-common';
import type { FootnoteDefinition, FootnoteReference } from 'myst-spec-ext';
import { HashLink, MyST } from 'myst-to-react';
import { selectAll } from 'unist-util-select';

export function Footnotes({
  containerClassName,
  innerClassName,
}: {
  containerClassName?: string;
  innerClassName?: string;
}) {
  const references = useReferences();
  const grid = useGridSystemProvider();
  const defs = selectAll('footnoteDefinition', references?.article) as FootnoteDefinition[];
  const refs = selectAll('footnoteReference', references?.article) as FootnoteReference[];
  if (defs.length === 0) return null;
  return (
    <section
      id="footnotes"
      className={classNames(grid, 'subgrid-gap col-screen', containerClassName)}
    >
      <div className={innerClassName}>
        <header className="text-lg font-semibold text-stone-900 dark:text-white group">
          Footnotes
          <HashLink id="footnotes" title="Link to Footnotes" hover className="ml-2" />
        </header>
      </div>
      <div
        className={classNames(
          'pl-3 mb-8 text-xs text-stone-500 dark:text-stone-300',
          innerClassName,
        )}
      >
        <ol>
          {defs.map((fn) => {
            return (
              <li key={(fn as GenericNode).key} id={`fn-${fn.identifier}`} className="group">
                <div className="flex flex-row">
                  <div className="break-words grow">
                    <MyST ast={fn.children} />
                  </div>
                  <div className="flex flex-col grow-0">
                    {refs
                      .filter((ref) => ref.identifier === fn.identifier)
                      .map((ref) => (
                        <HashLink
                          key={(ref as GenericNode).key}
                          id={`fnref-${(ref as GenericNode).key}`}
                          title="Link to Content"
                          hover
                          className="p-1"
                          children="↩"
                          scrollBehavior="instant"
                        />
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
