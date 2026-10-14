// Thay "cloudflare:sockets" khi chạy Vitest: test truyền máy chủ SMTP giả qua tham số opener.
export function connect(): never { throw new Error("cloudflare:sockets không có trong Vitest"); }
