import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedErrorOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';

export default function Error({ output }: { output: MinifiedErrorOutput }) {
  return (
    <MaybeLongContent
      content={ensureString(output.traceback)}
      path={output.path}
      render={(content?: string) => {
        return (
          <pre className="myst-jp-error-output text-sm font-thin font-system jupyter-error">
            <Ansi>{content ?? ''}</Ansi>
          </pre>
        );
      }}
    />
  );
}
