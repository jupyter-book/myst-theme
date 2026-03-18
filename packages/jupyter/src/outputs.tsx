import type { GenericNode } from 'myst-common';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useCellExecution } from './execute/index.js';
import { usePlaceholder } from './decoration.js';
import { Details, MyST } from 'myst-to-react';
import { selectAll } from 'unist-util-select';
import { OutputsContextProvider } from './providers.js';
import { ActiveJupyterCellOutputs } from './active.js';

export function Outputs({ node }: { node: GenericNode }) {
  const className = classNames({ hidden: node.visibility === 'remove' });
  const { children, identifier, align } = node;
  const outputsId = node.id ?? node.key;
  const cellExecutionContext = useCellExecution(outputsId);
  const { ready } = cellExecutionContext;

  const legacyOutputsArray = useMemo(() => {
    return selectAll('output', node).map((child) => (child as any).jupyter_data);
  }, [children]);
  const atLeastOneChildHasJupyterData = legacyOutputsArray.length > 0;

  // NOTE: a placeholder is actually an option on the figure node, not the outputs node
  // perhaps we should move the placeholder to the figure renderer?
  const placeholder = usePlaceholder();
  if (!ready && placeholder) {
    return <MyST ast={placeholder} />;
  }

  // if not ready, we leave each output to independently render
  // NOTE: we need to see that bokeh & plotly can render ok in this way
  if (!ready) {
    const passiveOutputs = (
      <div
        data-name="outputs-container"
        id={identifier || undefined}
        data-mdast-node-id={outputsId}
        className={classNames(
          'max-w-full overflow-y-visible overflow-x-auto m-0 group relative',
          {
            'text-left': !align || align === 'left',
            'text-center': align === 'center',
            'text-right': align === 'right',
            'mb-5': atLeastOneChildHasJupyterData,
          },
          className,
        )}
      >
        <OutputsContextProvider outputsId={outputsId}>
          <MyST ast={children} />
        </OutputsContextProvider>
      </div>
    );

    if (node.visibility === 'hide') {
      return <Details title="Output">{passiveOutputs}</Details>;
    }
    return passiveOutputs;
  }

  // else compute is ready, and we need to treat the whole cell output as one unit
  return <ActiveJupyterCellOutputs outputsId={outputsId} outputs={legacyOutputsArray} />;
}
