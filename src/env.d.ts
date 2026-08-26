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
    /**
     * KV namespace holding reader reports: one record per reader, entry and day,
     * whose value is the verdict. No count is stored — counts are derived by listing
     * the prefix when an editor works the queue (src/lib/code-reports.ts).
     */
    REPORTS?: FreetinsReportStore;
    /** Secret used to make the reader-report dedup fingerprint one-way. */
    REPORT_SECRET?: string;
  }
}

/**
 * What the binding provides, which has to stay in step with `CodeReportStore` in
 * src/lib/code-reports.ts: the endpoint passes `env.REPORTS` straight through with no
 * cast, so a method missing here is a compile error rather than a runtime surprise.
 * `list` is the aggregation path only and is never called while answering a reader.
 */
interface FreetinsReportStore {
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options: { prefix: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
}

interface FreetinsStatusStore {
  get(key: string, type: 'json'): Promise<unknown>;
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}
