import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  basename: process.env.BASE_URL ?? '/',
} satisfies Config;
