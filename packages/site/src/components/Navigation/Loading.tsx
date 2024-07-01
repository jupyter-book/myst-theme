import { useNavigation } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

/**
 * Show a loading progess bad if the load takes more than 150ms
 */
export function useLoading() {
  const transitionState = useNavigation().state;
  const ref = useMemo<{ start?: NodeJS.Timeout; finish?: NodeJS.Timeout }>(() => ({}), []);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (transitionState === 'loading') {
      ref.start = setTimeout(() => {
        setShowLoading(true);
      }, 150);
    } else {
      if (ref.start) {
        // We have stoped loading in <150ms
        clearTimeout(ref.start);
        delete ref.start;
        setShowLoading(false);
        return;
      }
      ref.finish = setTimeout(() => {
        setShowLoading(false);
      }, 150);
    }
    return () => {
      if (ref.start) {
        clearTimeout(ref.start);
        delete ref.start;
      }
      if (ref.finish) {
        clearTimeout(ref.finish);
        delete ref.finish;
      }
    };
  }, [transitionState]);

  return { showLoading, isLoading: transitionState === 'loading' };
}

export function LoadingBar() {
  const { isLoading, showLoading } = useLoading();
  if (!showLoading) return null;
  return (
    <div
      className={classNames(
        'w-screen h-[2px] bg-blue-500 absolute left-0 bottom-0 transition-transform',
        {
          'animate-load scale-x-40': isLoading,
          'scale-x-100': !isLoading,
        },
      )}
    />
  );
}
