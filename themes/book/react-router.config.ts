import type { Config } from '@react-router/dev/config';

// Inputs
const IS_BUILD_HTML = !!process.env.BUILD_HTML;

const getConfig = () => {
  if (IS_BUILD_HTML) {
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
