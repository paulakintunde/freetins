/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace Cloudflare {
  interface Env {
    DB: FreetinsDatabase;
    STATUS?: FreetinsStatusStore;
    RATE_LIMIT_SALT?: string;
    CONTACT_HASH_SECRET?: string;
    EDITOR_ACCESS_PASSWORD?: string;
    EDITOR_ACCESS_SESSION_SECRET?: string;
    EMAIL_DIGEST_ENABLED?: string;
    ALERT_CONFIRMATION_SECRET?: string;
    ALERT_EMAIL?: FreetinsQueue;
    ALERT_RELEASES?: FreetinsQueue;
  }
}

interface FreetinsPreparedStatement {
  bind(...values: unknown[]): FreetinsPreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface FreetinsDatabase {
  prepare(query: string): FreetinsPreparedStatement;
  batch<T = unknown>(statements: FreetinsPreparedStatement[]): Promise<T[]>;
}

interface FreetinsQueue {
  send(message: unknown): Promise<void>;
}

interface FreetinsStatusStore {
  get(key: string, type: 'json'): Promise<unknown>;
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}
