/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace Cloudflare {
  interface Env {
    STATUS?: FreetinsStatusStore;
  }
}

interface FreetinsStatusStore {
  get(key: string, type: 'json'): Promise<unknown>;
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}
