import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  basename: process.env.BASE_URL ?? '/',
  future: {
    v8_passThroughRequests: true,
  },
} satisfies Config;
