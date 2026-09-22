import { startJupyterLiteServer } from './jlite.js';
import type { ThebeLiteGlobal } from './types.js';
import version from './version.js';

declare global {
  interface Window {
    thebeLite?: ThebeLiteGlobal;
  }
}

function setupThebeLite() {
  window.thebeLite = Object.assign(window.thebeLite ?? {}, { startJupyterLiteServer, version });
}

if (typeof window !== 'undefined') {
  console.debug('window is defined, setting up thebe-lite');
  setupThebeLite();
  console.debug(`thebe-lite (v${window.thebeLite?.version ?? 0})`, window.thebeLite);
}

export type { LiteServerConfig, ThebeLiteGlobal } from './types.js';
export { startJupyterLiteServer, setupThebeLite };
