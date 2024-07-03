import { useGridSystemProvider, useReferences } from '@myst-theme/providers';
import classNames from 'classnames';
import { HashLink } from 'myst-to-react';
import { useState } from 'react';

const HIDE_OVER_N_REFERENCES = 5;

export function Bibliography({
  containerClassName,
  innerClassName,
}: {
  containerClassName?: string;
  innerClassName?: string;
}) {
  const references = useReferences();
  const grid = useGridSystemProvider();
  const { order, data } = references?.cite ?? {};
  const filtered = order?.filter((l) => l);
  const [hidden, setHidden] = useState(true);
  if (!filtered || !data || filtered.length === 0) return null;
  const refs = hidden ? filtered.slice(0, HIDE_OVER_N_REFERENCES) : filtered;
  return (
    <section
      id="references"
      className={classNames(grid, 'subgrid-gap col-screen', containerClassName)}
    >
      <div className={innerClassName}>
        {filtered.length > HIDE_OVER_N_REFERENCES && (
          <button
            onClick={() => setHidden(!hidden)}
            className="float-right p-1 px-2 text-xs border rounded hover:border-blue-500 dark:hover:border-blue-400"
          >
            {hidden ? 'Show All' : 'Collapse'}
          </button>
        )}
        <header className="text-lg font-semibold text-stone-900 dark:text-white group">
          References
          <HashLink id="references" title="Link to References" hover className="ml-2" />
        </header>
      </div>
      <div
        className={classNames(
          'pl-3 mb-8 text-xs text-stone-500 dark:text-stone-300',
          innerClassName,
        )}
      >
        <ol>
          {refs.map((label) => {
            const { html } = data[label];
            return (
              <li
                key={label}
                className="break-words"
                id={`cite-${label}`}
                dangerouslySetInnerHTML={{ __html: html || '' }}
              />
            );
          })}
          {filtered.length > HIDE_OVER_N_REFERENCES && (
            <li className="text-center list-none">
              <button
                onClick={() => setHidden(!hidden)}
                className="p-2 border rounded hover:border-blue-500 dark:hover:border-blue-400"
              >
                {hidden ? `Show all ${filtered.length} references` : 'Collapse references'}
              </button>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
