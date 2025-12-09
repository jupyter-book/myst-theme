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
  const isExternal = (url?.startsWith('http:') || url?.startsWith('https:') || url?.startsWith('mailto:'));
  if (!baseurl || isExternal) {
    return url as string;
  };
  return baseurl + url;
}
