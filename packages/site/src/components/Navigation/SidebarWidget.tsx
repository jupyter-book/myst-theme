import React, { useEffect, useRef } from 'react';

/**
 * Renders a container div and loads the sidebar_mount_js ESM. When loaded,
 * calls renderSidebar(container) so the script can use plain DOM APIs on the
 * container. The script URL is rewritten by the theme (content server or
 * /myst_assets_folder/ in static).
 */
export function SidebarWidget({
  scriptUrl,
  baseurl = '',
}: {
  scriptUrl: string;
  baseurl?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scriptUrl) return;

    const fullUrl = scriptUrl.startsWith('http') ? scriptUrl : (baseurl || '') + scriptUrl;

    import(/* @vite-ignore */ fullUrl)
      .then((module) => {
        if (typeof module.renderSidebar === 'function') {
          module.renderSidebar(container);
        }
      })
      .catch(() => {
        // Script failed to load or has no renderSidebar export
      });
  }, [scriptUrl, baseurl]);

  return <div ref={containerRef} className="myst-sidebar-widget" />;
}
