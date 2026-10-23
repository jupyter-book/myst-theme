/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
