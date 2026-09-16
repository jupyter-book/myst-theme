import type { Config } from '@react-router/dev/config';
import { config as prerenderConfig } from '@myst-theme/prerender';

// Inputs
const BASE_URL = process.env.BASE_URL ?? '/';
const IS_HTML_BUILD = !!process.env.BUILD_HTML;

const getConfig = () => {
  if (IS_HTML_BUILD) {
    // Set meta var for static build
    process.env.VITE_ENV_STATIC_BUILD = '1';
    return {
      ssr: false,
      basename: BASE_URL,
      ...prerenderConfig,
    } satisfies Config;
  } else {
    return {
      ssr: true,
      basename: process.env.BASE_URL ?? '/',
    } satisfies Config;
  }
};

export default getConfig();
