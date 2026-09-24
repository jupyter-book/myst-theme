import type { Config } from '@react-router/dev/config';

// Inputs
const IS_VITE_BUILD_HTML = !!process.env.VITE_BUILD_HTML;

const getConfig = () => {
  if (IS_VITE_BUILD_HTML) {
    return {
      ssr: true,
      routeDiscovery: { mode: 'initial' },
    } satisfies Config;
  } else {
    return {
      ssr: true,
      basename: process.env.BASE_URL ?? '/',
    } satisfies Config;
  }
};

export default getConfig();
