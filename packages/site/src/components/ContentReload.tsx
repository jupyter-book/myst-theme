import { useEffect } from 'react';

const STORAGE_KEY = 'myst';

async function mystLiveReloadConnect(config: { onOpen?: () => void; port?: string | number }) {
  if (!config.port || (window as any).mystLiveReloadConnected) return;
  (window as any).mystLiveReloadConnected = true;
  setTimeout(() => {
    const myst = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    if (myst.scroll) {
      window.scrollTo(0, myst.scroll);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, 30);
  console.log(`🔊 Listening to live content changes on port ${config.port}`);
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = location.hostname;
  const socketPath = `${protocol}//${host}:${config.port}/socket`;
  const ws = new WebSocket(socketPath);

  ws.onmessage = (message) => {
    const event = JSON.parse(message.data);
    if (event.type === 'LOG') {
      console.log(event.message);
    }
    if (event.type === 'RELOAD') {
      console.log('🚀 Reloading window ...');
      console.log(`📌 Keeping scroll for page at ${window.scrollY}`);
      const myst = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      myst.scroll = window.scrollY;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(myst));
      window.location.reload();
    }
  };
  ws.onopen = () => {
    if (config && typeof config.onOpen === 'function') {
      config.onOpen();
    }
  };
  ws.onclose = () => {
    console.log('MyST content server web socket closed. Reconnecting...');
    setTimeout(
      () =>
        mystLiveReloadConnect({
          ...config,
          onOpen: () => window.location.reload(),
        }),
      1000,
    );
  };
  ws.onerror = (error: any) => {
    console.log('MyST content server web socket error:');
    console.error(error);
  };
}

// Inspired by the LiveReload component in Remix
export function ContentReload({ port }: { port?: string | number }) {
  useEffect(() => {
    mystLiveReloadConnect({ port });
  }, []);
  return null;
}
