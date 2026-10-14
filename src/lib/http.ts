// Tiện ích phản hồi JSON + lỗi tiếng Việt.
export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}
export const fail = (status: number, message: string, code?: string) => { throw new HttpError(status, message, code); };

export async function readJson<T>(request: Request): Promise<T> {
  try { return (await request.json()) as T; } catch { return fail(400, "Dữ liệu gửi lên không đúng định dạng."); }
}

/** Bọc handler: bắt HttpError → JSON lỗi; lỗi khác → 500 chung (không lộ chi tiết). */
export function route<C>(fn: (ctx: C) => Promise<Response>) {
  return async (ctx: C) => {
    try { return await fn(ctx); }
    catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
      console.error("api_error", e instanceof Error ? e.message : "unknown");
      return json({ error: "Máy chủ đang gặp sự cố. Bạn thử lại sau ít phút." }, 500);
    }
  };
}
