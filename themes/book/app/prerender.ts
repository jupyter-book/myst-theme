import { prerender } from '@myst-theme/prerender';
import * as build from 'virtual:react-router/server-build';

const outPath = process.env.OUTDIR ? process.env.OUTDIR : './build/client';

await prerender(build, outPath);
