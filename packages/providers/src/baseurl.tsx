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

/**
 * Check if a URL is external. Optionally pass an internal domain pattern
 * (e.g. "example.com") to treat matching URLs as internal.
 */
export function isExternalUrl(url?: string, internalDomain?: string) {
  if (!/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(url || '')) return false;
  if (internalDomain) {
    const escaped = internalDomain.trim().replace(/\./g, '\\.').replace(/\*/g, '[^/]+');
    if (new RegExp(`^https?://${escaped}([:/?#]|$)`, 'i').test(url || '')) return false;
  }
  return true;
}

export function withBaseurl(url?: string, baseurl?: string) {
  if (!baseurl || isExternalUrl(url)) {
    return url as string;
  }
  return baseurl + url;
}
