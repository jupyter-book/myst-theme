import type { Config } from '@react-router/dev/config';
import { Readable } from 'node:stream';
import { config as prerenderConfig } from '@myst-theme/prerender';

// Inputs
const BASE_URL = process.env.BASE_URL ?? '/';
process.env.VITE_ENV_STATIC_BUILD = '1';

export default {
  ssr: false,
  basename: BASE_URL,
  ...prerenderConfig,
} satisfies Config;
