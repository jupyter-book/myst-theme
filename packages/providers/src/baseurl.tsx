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

export function isExternalUrl(url?: string) {
  // External if it has a URL scheme (e.g., https:, mailto:) or is protocol-relative (//host).
  return /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(url || '');
}

export function withBaseurl(url?: string, baseurl?: string) {
  if (!baseurl || isExternalUrl(url)) {
    return url as string;
  }
  return baseurl + url;
}
