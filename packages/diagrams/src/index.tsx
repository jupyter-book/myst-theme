import type { NodeRenderer } from '@myst-theme/providers';
import { useEffect, useId, useState } from 'react';
import classNames from 'classnames';
import type { Mermaid } from 'mermaid';

// Follow previous flow of importing mermaid dynamically.
// This is just a refactor, it might not be necessary.
let _mermaid: Mermaid | undefined = undefined;
async function loadMermaid(): Promise<Mermaid> {
  if (_mermaid === undefined) {
    const module = await import('mermaid');
    _mermaid = module.default;
    _mermaid.initialize({ startOnLoad: false });
  }
  return _mermaid;
}

export function MermaidRenderer({
  id,
  value,
  className,
}: {
  value: string;
  id: string;
  className?: string;
}) {
  const key = useId();
  const [graph, setGraph] = useState<string>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    const render = async () => {
      try {
        const mermaidID = `mermaid-${key.replace(/:/g, '')}`;
        const mermaid = await loadMermaid();
        const { svg } = await mermaid.render(mermaidID, value);
        setGraph(svg);
        setError(undefined);
      } catch (err) {
        setGraph(undefined);
        setError(err as Error);
      }
    };
    render();
  }, []);
  return (
    <figure id={id} className={className}>
      {graph && <div dangerouslySetInnerHTML={{ __html: graph }}></div>}
      {error && (
        <pre>
          Error parsing mermaid graph.
          {'\n\n'}
          {error.message}
          {'\n\n'}
          {value}
        </pre>
      )}
    </figure>
  );
}

export const MermaidNodeRenderer: NodeRenderer = ({ node, className }) => {
  return (
    <MermaidRenderer
      id={node.html_id || node.identifier}
      value={node.value}
      className={classNames(node.class, className)}
    />
  );
};
