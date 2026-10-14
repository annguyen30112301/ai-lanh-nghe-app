// Kiểu tối giản cho Workers runtime (không cài @cloudflare/workers-types để tránh xung đột với DOM).
interface D1Result<T = Record<string, unknown>> { results: T[]; success: boolean; meta: { changes?: number; last_row_id?: number } }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(col?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}
interface Fetcher { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> }

declare module "cloudflare:workers" {
  export const env: Env & {
    RESEND_API_KEY?: string;
    TRIAL_API_KEY?: string;
  };
}
