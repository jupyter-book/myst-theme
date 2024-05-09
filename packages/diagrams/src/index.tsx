import type { NodeRenderer } from '@myst-theme/providers';
import { useEffect, useId, useState } from 'react';

async function parse(id: string, text: string): Promise<string> {
  const { default: mermaid } = await import('mermaid');
  return await new Promise<string>((resolve) => {
    (mermaid as any).render(id, text, (code: any) => {
      resolve(code);
    });
  });
}

export function MermaidRenderer({ id, value }: { value: string; id: string }) {
  const key = useId();
  const [graph, setGraph] = useState<string>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    parse(`mermaid-${key.replace(/:/g, '')}`, value)
      .then((svg) => {
        setGraph(svg);
        setError(undefined);
      })
      .catch((err) => {
        setGraph(undefined);
        setError(err as Error);
      });
  }, []);
  return (
    <figure id={id}>
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

export const MermaidNodeRenderer: NodeRenderer = ({ node }) => {
  return <MermaidRenderer id={node.html_id || node.identifier} value={node.value} />;
};
