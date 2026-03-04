import React, { useContext } from 'react';

import escape from 'regexp.escape';

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

const URL_LIKE_REGEX = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/;

/**
 * Check if a URL is external. Optionally pass an internal domain pattern
 * (e.g. "example.com") to treat matching URLs as internal.
 */
export function isExternalUrl(url?: string, internalDomain?: string) {
  if (!URL_LIKE_REGEX.test(url || '')) {
    return false;
  }

  if (!internalDomain) {
    return true;
  }

  // Build array of domain parts, where the leading
  // component may be a wildcard
  const wildcardPattern = '[^\\./#]+';
  const parts = internalDomain
    .trim()
    .split('.')
    .map((part, index) => (part === '*' && index === 0 ? wildcardPattern : escape(part)));
  const domainPattern = parts.join(escape('.'));

  return !new RegExp(`^https?://${domainPattern}([:/?#]|$)`, 'i').test(url || '');
}

export function withBaseurl(url?: string, baseurl?: string) {
  if (!baseurl || isExternalUrl(url)) {
    return url as string;
  }
  return baseurl + url;
}
