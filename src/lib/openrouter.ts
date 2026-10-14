// OpenRouter OAuth PKCE: người dùng bấm một nút, OpenRouter tạo key gắn với tài khoản của họ.
import { fail } from "./http";

export function authUrl(callbackUrl: string, challenge: string) {
  const u = new URL("https://openrouter.ai/auth");
  u.searchParams.set("callback_url", callbackUrl);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

export async function exchangeCode(code: string, verifier: string) {
  const res = await fetch("https://openrouter.ai/api/v1/auth/keys", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: "S256" })
  });
  if (!res.ok) fail(400, "OpenRouter chưa xác nhận kết nối. Bạn bấm Kết nối lại nhé.", "oauth");
  const j = (await res.json()) as { key?: string };
  return j.key || fail(400, "OpenRouter không trả key. Bạn bấm Kết nối lại nhé.", "oauth");
}
