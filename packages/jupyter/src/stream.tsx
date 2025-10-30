import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedStreamOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';

export default function Stream({ output }: { output: MinifiedStreamOutput }) {
  return (
    <MaybeLongContent
      content={ensureString(output.text)}
      path={output.path}
      render={(content?: string) => (
        <pre className="myst-jp-stream-output text-sm font-thin font-system">
          <Ansi>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
