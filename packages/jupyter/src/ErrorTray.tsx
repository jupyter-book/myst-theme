import { useEffect, useState } from 'react';
import type { PassiveCellRenderer } from 'thebe-core';
import type { IThebeNotebookError } from 'thebe-react';
import { useThebeLoader } from 'thebe-react';

function ErrorDecoration({ children, idx }: React.PropsWithChildren<{ idx?: number }>) {
  return (
    <div className="relative py-3 mx-2 my-8 border rounded">
      <div className="absolute z-10 flex items-center bg-white -top-3 -left-2">
        {idx && <div className="ml-1 text-sm text-gray-500">cell #: {idx}</div>}
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
        <div className="min-w-[400px]">
          <ErrorDecoration idx={error.index}>
            <div className="z-100" key={error.id} ref={refs[idx]}></div>
          </ErrorDecoration>
        </div>
      ))}
    </div>
  );
}

export function ErrorTray({ errors }: { errors: IThebeNotebookError[] }) {
  return (
    <div className="relative px-4 pt-3 mt-8 text-sm text-red-600 border border-red-400 rounded border-1">
      <div>
        <span className="font-bold">Error</span> - a page refresh may resolve this. If not, shutdown
        this simulation and start another. If the error persists please contact support with a
        screenshot of this page, including the error message below.
      </div>
      <ErrorTrayMessage errors={errors} />
    </div>
  );
}
