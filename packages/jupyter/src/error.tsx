import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedErrorOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';
import React, { useRef, useState, useEffect } from 'react';

export default function Error({ output }: { output: MinifiedErrorOutput }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      // Check for horizontal overflow
      setIsScrollable(el.scrollWidth > el.clientWidth);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <MaybeLongContent
      content={ensureString(output.traceback)}
      path={output.path}
      render={(content?: string) => (
        <pre
          ref={preRef}
          tabIndex={isScrollable ? 0 : undefined}
          role={isScrollable ? 'region' : undefined}
          aria-label="error output"
          className="myst-jp-error-output text-sm font-thin font-system jupyter-error overflow-auto"
        >
          <Ansi>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
