// Inspired by the LiveReload component in Remix
export const ContentReload =
  process.env.NODE_ENV !== 'development'
    ? () => null
    : ({ port }: { port?: string | number }) => {
        if (!port) return null;
        return (
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `
                function mystLiveReloadConnect(config) {
                  let protocol = location.protocol === "https:" ? "wss:" : "ws:";
                  let host = location.hostname;
                  let socketPath = protocol + "//" + host + ":" + ${port} + "/socket";
                  let ws = new WebSocket(socketPath);
                  ws.onmessage = (message) => {
                    let event = JSON.parse(message.data);
                    if (event.type === "LOG") {
                      console.log(event.message);
                    }
                    if (event.type === "RELOAD") {
                      console.log("🚀 Reloading window ...");
                      window.location.reload();
                    }
                  };
                  ws.onopen = () => {
                    if (config && typeof config.onOpen === "function") {
                      config.onOpen();
                    }
                  };
                  ws.onclose = (error) => {
                    console.log("MyST content server web socket closed. Reconnecting...");
                    setTimeout(
                      () =>
                        mystLiveReloadConnect({
                          onOpen: () => window.location.reload(),
                        }),
                      1000
                    );
                  };
                  ws.onerror = (error) => {
                    console.log("MyST content server web socket error:");
                    console.error(error);
                  };
                }
                mystLiveReloadConnect();
              `,
            }}
          />
        );
      };
