/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE?: string;
  /**
   * Google Search Console verification token, token only — no `google-site-verification=`
   * prefix and no surrounding `<meta>` tag. Read once in `src/data/site.ts`; unset means
   * no verification tag is emitted, which is deliberate. See the comment there.
   */
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
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
