import { useEffect, useState } from 'react';
import type { PassiveCellRenderer } from 'thebe-core';
import type { IThebeNotebookError } from 'thebe-react';
import { useThebeLoader } from 'thebe-react';
import { useBusyErrors } from './execute/busy.js';

function ErrorDecoration({ children, idx }: React.PropsWithChildren<{ idx?: number }>) {
  return (
    <div className="relative py-3 mx-2 my-8 border rounded">
      <div className="absolute z-10 flex items-center bg-white -top-3 -left-2">
        {idx && <div className="ml-1 text-sm text-gray-500">cell #: {idx + 1}</div>}
      </div>
      <div className="mx-3">{children}</div>
    </div>
  );
}

function ErrorTrayMessage({ errors }: { errors: IThebeNotebookError[] }) {
  const { core } = useThebeLoader();

  const [cells, setCells] = useState<PassiveCellRenderer[]>([]);
  const [refs, setRefs] = useState<((node: HTMLDivElement) => void)[]>([]);

  useEffect(() => {
    if (!core) return;
    const cs = errors.map(() => new core.PassiveCellRenderer('any'));
    setRefs(
      errors.map((_, idx) => (node: any) => {
        if (node) {
          cs[idx].attachToDOM(node);
          cs[idx].render(errors[idx].error ?? []);
        }
      }),
    );
    setCells(cells);
  }, [core, errors]);

  if (!core) return null;
  return (
    <div>
      {errors.map((error, idx) => (
        <div key={`error-${error.id}`} className="not-prose min-w-[400px]">
          <ErrorDecoration idx={error.index}>
            <div className="z-100" key={error.id} ref={refs[idx]}></div>
          </ErrorDecoration>
        </div>
      ))}
    </div>
  );
}

export function ErrorTray({ pageSlug, index }: { pageSlug: string; index?: string }) {
  const { items } = useBusyErrors(pageSlug);
  if (!items || items.length === 0) return null;
  if (index && index) return null;
  return (
    <div className="relative px-4 pt-3 my-8 text-sm text-red-600 border border-red-400 rounded border-1">
      {items.map(({ notebookSlug, errors }, i) => {
        return (
          <div key={`${notebookSlug}-${i}`}>
            <div>
              <span className="font-bold">Error</span> in notebook <span>"{notebookSlug}"</span>
            </div>
            <ErrorTrayMessage errors={errors} />
          </div>
        );
      })}
    </div>
  );
}
