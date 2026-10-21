// License và giới hạn thiết bị – hàm thuần, dùng chung máy chủ và test.

/** Số thiết bị đăng nhập cùng lúc cho một tài khoản (tài khoản demo không giới hạn). */
export const DEVICE_LIMIT = 2;

const DAY = 864e5;
const VN = 7 * 36e5;

/** Mốc hết hạn (ms) của license có ngày cuối valid_to (YYYY-MM-DD): hết ngày đó theo giờ Việt Nam. */
export const licenseEnd = (validTo: string) => Date.parse(validTo + "T00:00:00Z") + DAY - VN;

/** Ngày (YYYY-MM-DD, giờ Việt Nam) của một mốc ms. */
export const vnDate = (t: number) => new Date(t + VN).toISOString().slice(0, 10);

export const isLicensed = (expiresAt: number | null | undefined, t = Date.now()) => !!expiresAt && expiresAt > t;

/** Ngày bắt đầu kỳ mới: còn hạn thì nối tiếp sau ngày hết hạn (gia hạn), hết hạn thì từ hôm nay. */
export function periodStart(expiresAt: number | null | undefined, t = Date.now()) {
  return isLicensed(expiresAt, t) ? vnDate(expiresAt! + 1) : vnDate(t);
}

/** Phiên cần đẩy ra khi vượt giới hạn: giữ `limit` phiên dùng gần nhất. */
export function sessionsOverLimit<S extends { seen: number }>(list: S[], limit = DEVICE_LIMIT) {
  return [...list].sort((a, b) => b.seen - a.seen).slice(limit);
}

/** Tên thiết bị dễ đọc từ user-agent (không lưu IP). */
export function deviceName(ua: string) {
  const b = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Trình duyệt";
  const o = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return o ? `${b} trên ${o}` : b;
}
