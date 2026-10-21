import { describe, expect, it } from "vitest";
import { deviceName, isLicensed, licenseEnd, periodStart, sessionsOverLimit, vnDate } from "../src/lib/license";

describe("license", () => {
  it("hết hạn vào cuối ngày valid_to theo giờ Việt Nam", () => {
    const end = licenseEnd("2027-10-20");
    expect(new Date(end).toISOString()).toBe("2027-10-20T17:00:00.000Z");
    expect(vnDate(end - 1)).toBe("2027-10-20");
    expect(vnDate(end)).toBe("2027-10-21");
  });

  it("isLicensed: chưa có hoặc đã qua mốc là không có license", () => {
    const t = Date.parse("2026-10-21T03:00:00Z");
    expect(isLicensed(null, t)).toBe(false);
    expect(isLicensed(t - 1, t)).toBe(false);
    expect(isLicensed(t + 1, t)).toBe(true);
  });

  it("periodStart: còn hạn thì nối tiếp ngày sau hạn, hết hạn thì từ hôm nay", () => {
    const t = Date.parse("2026-10-21T03:00:00Z");
    expect(periodStart(null, t)).toBe("2026-10-21");
    expect(periodStart(licenseEnd("2026-10-01"), t)).toBe("2026-10-21");
    expect(periodStart(licenseEnd("2027-03-31"), t)).toBe("2027-04-01");
  });
});

describe("giới hạn thiết bị", () => {
  it("giữ 2 phiên dùng gần nhất, đẩy các phiên cũ hơn", () => {
    const out = sessionsOverLimit([{ rid: 1, seen: 10 }, { rid: 2, seen: 30 }, { rid: 3, seen: 20 }, { rid: 4, seen: 5 }]);
    expect(out.map((x) => x.rid)).toEqual([1, 4]);
  });
  it("chưa vượt giới hạn thì không đẩy ai", () => {
    expect(sessionsOverLimit([{ rid: 1, seen: 1 }, { rid: 2, seen: 2 }])).toEqual([]);
  });
  it("tên thiết bị từ user-agent", () => {
    expect(deviceName("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36")).toBe("Chrome trên macOS");
    expect(deviceName("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1")).toBe("Safari trên iOS");
    expect(deviceName("")).toBe("Trình duyệt");
  });
});
