// Giá niêm yết (USD / 1 triệu token) cho nguồn không trả giá qua API (Gemini, OpenAI).
// Nhóm rà lại theo trang giá của nhà cung cấp; mô hình không có ở đây thì hiện "—".
// Khóa là id mô hình đúng như API danh sách trả về (Gemini bỏ tiền tố "models/").
export const MODEL_PRICES: Record<string, { in: number; out: number; context?: number }> = {
  "gemini-2.5-pro": { in: 1.25, out: 10 },
  "gemini-2.5-flash": { in: 0.3, out: 2.5 },
  "gemini-2.5-flash-lite": { in: 0.1, out: 0.4 },
  "gemini-2.0-flash": { in: 0.1, out: 0.4 },
  "gpt-4.1": { in: 2, out: 8, context: 1_047_576 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6, context: 1_047_576 },
  "gpt-4.1-nano": { in: 0.1, out: 0.4, context: 1_047_576 },
  "gpt-4o": { in: 2.5, out: 10, context: 128_000 },
  "gpt-4o-mini": { in: 0.15, out: 0.6, context: 128_000 }
};
