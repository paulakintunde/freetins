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
    /** KV namespace holding reader report counts and dedup fingerprints. */
    REPORTS?: FreetinsReportStore;
    /** Secret used to make the reader-report dedup fingerprint one-way. */
    REPORT_SECRET?: string;
  }
}

interface FreetinsReportStore {
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface FreetinsStatusStore {
  get(key: string, type: 'json'): Promise<unknown>;
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}
