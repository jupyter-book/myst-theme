import { useState, useEffect, useRef } from 'react';
import { MyST } from 'myst-to-react';
import classNames from 'classnames';
import type { GenericParent } from 'myst-common';
import { hashString } from '~/utils/hash';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useBannerState } from '@myst-theme/providers';

/**
 * A dismissible banner component at the top that shows content passed as a MyST AST.
 */
export function Banner({ content, className }: { content: GenericParent; className?: string }) {
  // Generate banner ID from content for storing dismissal state
  const contentString = JSON.stringify(content);
  const bannerId = hashString(contentString);

  // // Start hidden, only show after checking localStorage on client
  // // This avoids flickering on initial load
  const { bannerState, setBannerState } = useBannerState();

  const ref = useRef<HTMLElement | null>(null);

  // Check dismissal state on client side
  // If the banner content changes, the ID will be different and it'll show again
  useEffect(() => {
    const el = ref.current;

    const dismissed = localStorage.getItem(`myst-dismissed-banner-${bannerId}`) === 'true';
    setBannerState({
      visible: !dismissed,
      height: el ? el.getBoundingClientRect().height : 0,
    });
  }, [bannerId, bannerState.visible]);
    const dismissed = localStorage.getItem(`myst-dismissed-banner-${bannerId}`) === 'true';
    setIsVisible(!dismissed);
  }, [bannerId]);

  const handleDismiss = () => {
    localStorage.setItem(`myst-dismissed-banner-${bannerId}`, 'true');
    setBannerState({
      visible: false,
      height: 0,
    });
  };

  // Don't render if not visible
  if (!bannerState.visible) return null;

  // Should be styled similarly to the footer
  return (
    <header
      aria-label="Announcement banner"
      className={classNames(
        'myst-banner w-full bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800',
        'px-4 py-3 sm:px-6 lg:px-8',
        'relative z-40',
        className,
      )}
      ref={ref}
    >
      <div className="max-w-screen-lg mx-auto flex items-center gap-4">
        {/* Banner content */}
        <div className="flex-1 text-sm text-center text-blue-900 dark:text-blue-50 [&>*]:m-0 [&_a]:underline [&_a]:font-semibold">
          <MyST ast={content} />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
          aria-label="Dismiss announcement"
          type="button"
        >
          <XMarkIcon className="w-5 h-5 text-blue-800 dark:text-blue-200" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
