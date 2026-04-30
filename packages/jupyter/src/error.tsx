import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedErrorOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';
import { useIsScrollable } from '@myst-theme/providers';

export default function Error({ output }: { output: MinifiedErrorOutput }) {
  const { ref, isScrollable } = useIsScrollable<HTMLPreElement>();

  return (
    <MaybeLongContent
      content={ensureString(output.traceback)}
      path={output.path}
      render={(content?: string) => (
        <pre
          ref={ref}
          tabIndex={isScrollable ? 0 : undefined}
          role={isScrollable ? 'region' : undefined}
          aria-label="cell error output"
          className="myst-jp-error-output text-sm font-thin font-system overflow-auto jupyter-error p-3"
        >
          <Ansi useClasses>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
