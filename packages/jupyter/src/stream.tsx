import Ansi from '@curvenote/ansi-to-react';
import { ensureString } from 'nbtx';
import type { MinifiedStreamOutput } from 'nbtx';
import { MaybeLongContent } from './components.js';
import React, { useRef, useState, useEffect } from 'react';

export default function Stream({ output }: { output: MinifiedStreamOutput }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setIsScrollable(el.scrollWidth > el.clientWidth);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <MaybeLongContent
      content={ensureString(output.text)}
      path={output.path}
      render={(content?: string) => (
        <pre 
          ref={preRef} // 2. Attach the ref here
          tabIndex={isScrollable ? 0 : undefined} // 3. Add accessibility
          role={isScrollable ? 'region' : undefined}
          aria-label="output stream"
          className="myst-jp-stream-output text-sm font-thin font-system overflow-auto"
        >
          <Ansi>{content ?? ''}</Ansi>
        </pre>
      )}
    />
  );
}
