import React, { useContext } from 'react';

const BaseUrlContext = React.createContext<{
  baseurl?: string;
}>({});

export function BaseUrlProvider({
  baseurl,
  children,
}: {
  baseurl?: string;
  children: React.ReactNode;
}) {
  return <BaseUrlContext.Provider value={{ baseurl }}>{children}</BaseUrlContext.Provider>;
}

export function useBaseurl() {
  const data = useContext(BaseUrlContext);
  return data?.baseurl;
}

export function withBaseurl(url?: string, baseurl?: string) {
  const isExternal = /^(https?|mailto):/.test(url || '');
  if (!baseurl || isExternal) {
    return url as string;
  }

  // Normalize baseurl: add leading slash, remove trailing slash
  let normalized = baseurl.trim();
  if (!normalized.startsWith('/')) normalized = '/' + normalized;
  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }

  return normalized + url;
}
