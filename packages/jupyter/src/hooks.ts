import useSWRImmutable from 'swr/immutable';
import type {
  MinifiedErrorOutput,
  MinifiedMimeBundle,
  MinifiedMimePayload,
  MinifiedOutput,
  MinifiedStreamOutput,
} from 'nbtx';
import { walkOutputs } from 'nbtx';
import { useState, useLayoutEffect } from 'react';

/**
 * Truncation vs Summarization
 *
 * In Curvespace, we're decided to change our data structure for outputs to align it as
 * closely as possible with Jupyters nbformat.IOutput[] type, but in a way that still allows
 * us to truncate output content and push that to storage.
 *
 * This will be used only in the CLI and Curvespace initially but should be ported back to
 * the rest of the code base. This will mean
 *
 * - changing the DB schema
 * - migration
 * - changing API response
 * - changing the frontend
 * - changing the extension
 *
 */

interface LongContent {
  content_type?: string;
  content: string;
}

async function fetcher(url: string) {
  const resp = await fetch(url);
  if (resp.status === 200) {
    const content = await resp.text();
    if (url.endsWith('.json')) {
      // This is for backward compatibility, previously we saved as:
      // { content: string, content_type: string }
      // This is now directly saved as the content (e.g. an image, json, html, text, etc.)
      try {
        const data = JSON.parse(content);
        const keys = Object.keys(data);
        if (keys.length === 2 && keys.includes('content') && keys.includes('content_type')) {
          return data;
        }
        // pass
      } catch (error) {
        // pass
      }
    }
    return { content } as any;
  }
  throw new Error(`Content returned with status ${resp.status}.`);
}

export function useLongContent(
  content?: string,
  url?: string,
): { data?: LongContent; error?: Error } {
  if (typeof document === 'undefined') {
    // This is ONLY called on the server
    return url ? {} : { data: { content: content ?? '' } };
  }
  const { data, error } = useSWRImmutable<LongContent>(url || null, fetcher);
  if (!url) return { data: { content: content ?? '' } };
  return { data, error };
}

const arrayFetcher = (...urls: string[]) => {
  return Promise.all(urls.map((url) => fetcher(url)));
};

type ObjectWithPath = MinifiedErrorOutput | MinifiedStreamOutput | MinifiedMimePayload;

function shallowCloneOutputs(outputs: MinifiedOutput[]) {
  return outputs.map((output) => {
    if ('data' in output && output.data) {
      const data = output.data as MinifiedMimeBundle;
      return {
        ...output,
        data: Object.entries(data).reduce((acc, [mimetype, payload]) => {
          return { ...acc, [mimetype]: { ...payload } };
        }, {}),
      };
    }
    return { ...output };
  });
}

export function useFetchAnyTruncatedContent(outputs: MinifiedOutput[]): {
  data: MinifiedOutput[] | undefined;
  error: any | undefined;
} {
  const itemsWithPaths: ObjectWithPath[] = [];
  const updated = shallowCloneOutputs(outputs);

  walkOutputs(updated, (obj) => {
    // images have paths, but we don't need to fetch them
    if ('content_type' in obj && (obj as MinifiedMimePayload).content_type.startsWith('image/'))
      return;
    if (obj.path) {
      itemsWithPaths.push(obj);
    }
  });

  const { data, error } = useSWRImmutable<LongContent[]>(
    itemsWithPaths.map(({ path }) => path),
    arrayFetcher,
  );

  data?.forEach(({ content }, idx) => {
    const obj = itemsWithPaths[idx];
    if ('text' in obj) {
      // stream
      obj.text = content;
    } else if ('traceback' in obj) {
      // error
      obj.traceback = content as any;
    } else {
      // mimeoutput
      obj.content = content;
    }
    obj.path = undefined;
  });

  return {
    data: itemsWithPaths.length === 0 || data ? updated : undefined,
    error,
  };
}

function getWindowSize() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useLayoutEffect(() => {
    function handleResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
