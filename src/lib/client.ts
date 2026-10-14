// Gọi API từ trình duyệt. Lỗi trả về luôn có thông báo tiếng Việt.
import type { MeResponse } from "../content/types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "same-origin", ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
  } catch {
    throw new ApiError(0, "Mất kết nối mạng. Bạn kiểm tra Internet rồi thử lại.");
  }
  const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) {
    if (res.status === 401 && !location.pathname.startsWith("/app/dang-nhap")) {
      location.href = "/app/dang-nhap/?next=" + encodeURIComponent(location.pathname + location.search);
    }
    throw new ApiError(res.status, j.error ?? "Có lỗi xảy ra. Bạn thử lại nhé.", j.code);
  }
  return j as T;
}
export const post = <T>(path: string, body: unknown, method = "POST") => api<T>(path, { method, body: JSON.stringify(body) });

let meP: Promise<MeResponse> | null = null;
export function getMe(force = false) {
  if (force || !meP) meP = api<MeResponse>("/api/me").catch((e) => { meP = null; throw e; });
  return meP;
}
export const isBusinessAdmin = (m: MeResponse) => m.org.role === "admin" && m.org.plan !== "personal";
export const errText = (e: unknown) => (e instanceof Error ? e.message : "Có lỗi xảy ra. Bạn thử lại nhé.");
