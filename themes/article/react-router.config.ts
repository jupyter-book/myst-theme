import type { Config } from '@react-router/dev/config';
import { getLinkBaseURL } from '@myst-theme/common'

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
      basename: `${getLinkBaseURL(process.env)}/`,
    } satisfies Config;
  }
};

export default getConfig();
