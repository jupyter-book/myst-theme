import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedStreamOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';
import { useIsScrollable } from '@myst-theme/providers';

export default function Stream({ output }: { output: MinifiedStreamOutput }) {
  const { ref, isScrollable } = useIsScrollable<HTMLPreElement>();

  return (
    <MaybeLongContent
      content={ensureString(output.text)}
      path={output.path}
      render={(content?: string) => (
        <pre
          ref={ref}
          tabIndex={isScrollable ? 0 : undefined}
          role={isScrollable ? 'region' : undefined}
          aria-label="cell output stream"
          className="myst-jp-stream-output text-sm font-thin font-system overflow-auto p-3"
        >
          <Ansi>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
