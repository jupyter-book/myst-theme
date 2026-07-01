/**
 * mystmd does not yet support declaring `remotes` in myst.yml, so this patches
 * the built site config directly.
 * Re-run it every time myst rebuilds the site.
 * Inspired by: https://github.com/myst-contrib/myst-theme-demo-renderer
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const configPath = path.join(import.meta.dirname, '..', '..', '_build', 'site', 'config.json');
const config = JSON.parse(readFileSync(configPath));
config.remotes = [{ name: 'myst_docs_extension', entry: '/dist/myst_docs_extension.js' }];
writeFileSync(configPath, JSON.stringify(config));
console.log(`Added remotes to ${configPath}`);
