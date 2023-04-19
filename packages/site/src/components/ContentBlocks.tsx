import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { Parent } from 'myst-spec';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';
import { useNotebook, useNotebookFromSource, useThebeSession } from 'thebe-react';
import { useEffect, useState } from 'react';

function Block({ id, node, className }: { id: string; node: Parent; className?: string }) {
  const renderers = useNodeRenderers() ?? DEFAULT_RENDERERS;
  const children = useParse(node, renderers);
  const subGrid = 'article-grid article-subgrid-gap col-screen';
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <div
      id={id}
      className={classNames(className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {children}
    </div>
  );
}

export function ContentBlocks({ mdast, className }: { mdast: Parent; className?: string }) {
  const blocks = mdast.children as Parent[];
  const [executed, setExecuted] = useState(false);
  // const { name, session, ready, start, starting } = useThebeSession();
  // const { notebook, busy, execute, attach, cellRefs } = useNotebookFromSource([
  //   'import matplotlib.pyplot as plt;\nimport ipywidgets',
  //   'ipywidgets.interact(lambda x, y: plt.plot([1,x,y]), x=5, y=5);',
  // ]);

  // console.log({ name, session, ready, start, starting });
  // console.log({ notebook, busy, execute, attach, cellRefs });

  // const clear = () => {
  //   notebook?.clear();
  // };
  // const go = () => {
  //   execute();
  // };

  // useEffect(() => {
  //   if (executed || !ready || !notebook || !session || !execute) return;
  //   attach(session);
  //   setExecuted(true);
  //   execute();
  // }, [session, ready, notebook, execute, executed]);

  return (
    <>
      {/* <button onClick={clear}>Clear!</button>
      <button onClick={go}>Execute</button> */}
      {/* {ready ? (
        <div className="bg-green-500">READY!</div>
      ) : (
        <div className="bg-red-500">Starting</div>
      )} */}
      {/* <div ref={cellRefs[0]}>output 1</div>
      <div ref={cellRefs[1]}>output 2</div> */}
      {blocks.map((node, index) => {
        return <Block key={(node as any).key} id={`${index}`} node={node} className={className} />;
      })}
    </>
  );
}
