import type { Config } from '@react-router/dev/config';

export default {
  basename: process.env.BASE_URL ?? '/',
  serverBuildFile: 'api/index.js',
  serverModuleFormat: 'esm',
  ssr: true,
} satisfies Config;
