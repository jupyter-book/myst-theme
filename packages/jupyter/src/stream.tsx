import Ansi from 'ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedStreamOutput } from 'nbtx';
import { MaybeLongContent } from './components';

export default function Stream({ output }: { output: MinifiedStreamOutput }) {
  return (
    <MaybeLongContent
      content={ensureString(output.text)}
      path={output.path}
      render={(content?: string) => (
        <pre className="text-sm font-thin font-system">
          <Ansi>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
