// WebCrypto thuần (chạy được cả Workers lẫn Node ≥ 20).
const enc = new TextEncoder();

export const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};
export const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const b64url = (buf: ArrayBuffer | Uint8Array) => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const randomId = (bytes = 16) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));
export const randomDigits = (n: number) => {
  const a = crypto.getRandomValues(new Uint32Array(n));
  return Array.from(a, (x) => String(x % 10)).join("");
};

export async function sha256(text: string) {
  return b64(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}
export async function sha256url(text: string) {
  return b64url(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

export async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** So sánh chuỗi không rò thời gian. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function aesKey(secretB64: string) {
  const raw = unb64(secretB64);
  if (raw.length !== 32) throw new Error("KEY_ENC_SECRET phải là 32 byte base64");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** AES-256-GCM. Trả { ciphertext, iv } dạng base64. */
export async function encryptSecret(secretB64: string, plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secretB64), enc.encode(plain));
  return { ciphertext: b64(ct), iv: b64(iv) };
}
export async function decryptSecret(secretB64: string, ciphertext: string, iv: string) {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(secretB64), unb64(ciphertext));
  return new TextDecoder().decode(pt);
}

/** PKCE S256 */
export async function pkcePair() {
  const verifier = randomId(48);
  return { verifier, challenge: await sha256url(verifier) };
}
