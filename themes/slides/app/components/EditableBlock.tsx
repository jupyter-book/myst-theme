import { useEffect, useRef } from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { usePageKind } from '@myst-theme/providers';
import { NOTEBOOK_BLOCK_RENDERERS, useCellExecution } from '@myst-theme/jupyter';
import { SourceFileKind } from 'myst-spec-ext';

/** The selector under which `@myst-theme/jupyter` renders notebook blocks. */
export const NOTEBOOK_BLOCK_SELECTOR = 'block[kind=notebook-code],block[kind=notebook-content]';
const NotebookBlock = (NOTEBOOK_BLOCK_RENDERERS.block as Record<string, NodeRenderer>)[
  NOTEBOOK_BLOCK_SELECTOR
];

/** Makes the code of a cell editable while a kernel is ready; Shift+Enter or Ctrl+Enter runs it. */
function EditableCode({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, cell, execute } = useCellExecution(id);

  useEffect(() => {
    const code = ref.current?.querySelector<HTMLElement>('pre code');
    if (!code || !ready || !cell) return;
    try {
      code.contentEditable = 'plaintext-only';
    } catch {
      // Browsers without plaintext-only editing accept rich editing; `innerText` stays plain.
      code.contentEditable = 'true';
    }
    code.spellcheck = false;
    const update = () => (cell.source = code.innerText);
    const run = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.shiftKey || event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      update();
      execute();
    };
    // A click in the code box but outside the text puts the cursor at the end.
    const box = code.closest<HTMLElement>('.myst-code');
    const focusEnd = (event: MouseEvent) => {
      const target = event.target as Element;
      if (code.contains(target) || target.closest('button')) return;
      event.preventDefault();
      code.focus();
      const selection = window.getSelection();
      selection?.selectAllChildren(code);
      selection?.collapseToEnd();
    };
    code.addEventListener('input', update);
    code.addEventListener('keydown', run);
    box?.addEventListener('mousedown', focusEnd);
    return () => {
      code.removeEventListener('input', update);
      code.removeEventListener('keydown', run);
      box?.removeEventListener('mousedown', focusEnd);
      code.removeAttribute('contenteditable');
    };
  }, [ready, cell, execute]);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

export const EditableBlock: NodeRenderer = (props) => {
  const kind = usePageKind();
  const block = <NotebookBlock {...props} />;
  if (kind !== SourceFileKind.Notebook || props.node.kind !== 'notebook-code') return block;
  return <EditableCode id={props.node.key}>{block}</EditableCode>;
};
