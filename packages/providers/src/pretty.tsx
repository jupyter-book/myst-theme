import React, { useContext } from 'react';

const PrettyUrlContext = React.createContext<{
  prettyurl: boolean;
}>({prettyurl: true});

export function PrettyUrlProvider({
  prettyurl,
  children,
}: {
  prettyurl?: boolean;
  children: React.ReactNode;
}) {
  if (typeof prettyurl === 'undefined') {
    prettyurl = true;
  }
  return <PrettyUrlContext.Provider value={{ prettyurl }}>{children}</PrettyUrlContext.Provider>;
}

export function usePrettyUrl() {
  const data = useContext(PrettyUrlContext);
  return data.prettyurl;
}

export function withPrettyUrl(url?: string, prettyurl?: boolean) {
  if (url && prettyurl === false && !url.endsWith('/')) {
    // handle fragments, won't work if query params ever happen
    const segments = url.split('#')
    segments[0] = segments[0] + '.html'
    url = segments.join('#')
    return url
  }
  return url as string
}
