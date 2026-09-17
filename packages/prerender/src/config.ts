import type { Config } from '@react-router/dev/config';

import { buildEnd } from './buildEnd.js';
import { prerender } from './prerender.js';

export const config = {
  prerender,
  buildEnd,
} satisfies Config;
