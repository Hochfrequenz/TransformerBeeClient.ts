import { describe, it, expect } from "vitest";

import {
  EdifactFormatVersion,
  getFormatVersionDescription,
  parseEdifactFormatVersion,
  getEdifactFormatVersion,
  getCurrentEdifactFormatVersion,
} from "../../src/dtos/edifact-format-version";

describe("EdifactFormatVersion", () => {
  describe("enum values", () => {
    it("should have FV2104 version", () => {
      expect(EdifactFormatVersion.FV2104).toBe("FV2104");
    });

    it("should have FV2110 version", () => {
      expect(EdifactFormatVersion.FV2110).toBe("FV2110");
    });

    it("should have FV2210 version", () => {
      expect(EdifactFormatVersion.FV2210).toBe("FV2210");
    });

    it("should have FV2304 version", () => {
      expect(EdifactFormatVersion.FV2304).toBe("FV2304");
    });

    it("should have FV2310 version", () => {
      expect(EdifactFormatVersion.FV2310).toBe("FV2310");
    });

    it("should have FV2404 version", () => {
      expect(EdifactFormatVersion.FV2404).toBe("FV2404");
    });

    it("should have FV2410 version", () => {
      expect(EdifactFormatVersion.FV2410).toBe("FV2410");
    });

    it("should have FV2504 version", () => {
      expect(EdifactFormatVersion.FV2504).toBe("FV2504");
    });

    it("should have FV2510 version", () => {
      expect(EdifactFormatVersion.FV2510).toBe("FV2510");
    });

    it("should have FV2604 version", () => {
      expect(EdifactFormatVersion.FV2604).toBe("FV2604");
    });

    it("should have FV2610 version", () => {
      expect(EdifactFormatVersion.FV2610).toBe("FV2610");
    });
  });

  describe("getFormatVersionDescription", () => {
    it("should return description for FV2104", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2104);
      expect(description).toContain("2021-04-01");
    });

    it("should return description for FV2110", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2110);
      expect(description).toContain("2021-10-01");
    });

    it("should return description for FV2210", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2210);
      expect(description).toContain("2022-10-01");
    });

    it("should return description for FV2304", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2304);
      expect(description).toContain("2023-04-01");
    });

    it("should return description for FV2310", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2310);
      expect(description).toContain("2023-10-01");
    });

    it("should return description for FV2404", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2404);
      expect(description).toContain("2024-04-01");
    });

    it("should return description for FV2410", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2410);
      expect(description).toContain("2024-10-01");
    });

    it("should return description for FV2504", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2504);
      expect(description).toContain("2025-06-06");
    });

    it("should return description for FV2510", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2510);
      expect(description).toContain("2025-10-01");
    });

    it("should return description for FV2604", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2604);
      expect(description).toContain("2026-04-01");
    });

    it("should return description for FV2610", () => {
      const description = getFormatVersionDescription(EdifactFormatVersion.FV2610);
      expect(description).toContain("2026-10-01");
    });
  });

  describe("parseEdifactFormatVersion", () => {
    it("should parse valid version string FV2104", () => {
      const result = parseEdifactFormatVersion("FV2104");
      expect(result).toBe(EdifactFormatVersion.FV2104);
    });

    it("should parse valid version string FV2110", () => {
      const result = parseEdifactFormatVersion("FV2110");
      expect(result).toBe(EdifactFormatVersion.FV2110);
    });

    it("should parse valid version string FV2210", () => {
      const result = parseEdifactFormatVersion("FV2210");
      expect(result).toBe(EdifactFormatVersion.FV2210);
    });

    it("should parse valid version string FV2304", () => {
      const result = parseEdifactFormatVersion("FV2304");
      expect(result).toBe(EdifactFormatVersion.FV2304);
    });

    it("should parse valid version string FV2310", () => {
      const result = parseEdifactFormatVersion("FV2310");
      expect(result).toBe(EdifactFormatVersion.FV2310);
    });

    it("should parse valid version string FV2404", () => {
      const result = parseEdifactFormatVersion("FV2404");
      expect(result).toBe(EdifactFormatVersion.FV2404);
    });

    it("should parse valid version string FV2410", () => {
      const result = parseEdifactFormatVersion("FV2410");
      expect(result).toBe(EdifactFormatVersion.FV2410);
    });

    it("should parse valid version string FV2504", () => {
      const result = parseEdifactFormatVersion("FV2504");
      expect(result).toBe(EdifactFormatVersion.FV2504);
    });

    it("should parse valid version string FV2510", () => {
      const result = parseEdifactFormatVersion("FV2510");
      expect(result).toBe(EdifactFormatVersion.FV2510);
    });

    it("should parse valid version string FV2604", () => {
      const result = parseEdifactFormatVersion("FV2604");
      expect(result).toBe(EdifactFormatVersion.FV2604);
    });

    it("should parse valid version string FV2610", () => {
      const result = parseEdifactFormatVersion("FV2610");
      expect(result).toBe(EdifactFormatVersion.FV2610);
    });

    it("should throw for invalid version string", () => {
      expect(() => parseEdifactFormatVersion("FV9999")).toThrow();
    });

    it("should throw for empty string", () => {
      expect(() => parseEdifactFormatVersion("")).toThrow();
    });

    it("should throw for lowercase version", () => {
      expect(() => parseEdifactFormatVersion("fv2310")).toThrow();
    });

    it("should include valid versions in error message", () => {
      try {
        parseEdifactFormatVersion("INVALID");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain("FV2304");
        expect(message).toContain("FV2310");
      }
    });
  });

  describe("getEdifactFormatVersion", () => {
    it("should return FV2104 for dates before 2021-10-01", () => {
      const date = new Date(Date.UTC(2021, 5, 15)); // 2021-06-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2104);
    });

    it("should return FV2110 for dates between 2021-10-01 and 2022-10-01", () => {
      const date = new Date(Date.UTC(2022, 5, 15)); // 2022-06-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2110);
    });

    it("should return FV2210 for dates between 2022-10-01 and 2023-04-01", () => {
      const date = new Date(Date.UTC(2023, 1, 15)); // 2023-02-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2210);
    });

    it("should return FV2304 for dates between 2023-04-01 and 2023-10-01", () => {
      const date = new Date(Date.UTC(2023, 6, 15)); // 2023-07-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2304);
    });

    it("should return FV2310 for dates between 2023-10-01 and 2024-04-03", () => {
      const date = new Date(Date.UTC(2024, 1, 15)); // 2024-02-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2310);
    });

    it("should return FV2404 for dates between 2024-04-03 and 2024-10-01", () => {
      const date = new Date(Date.UTC(2024, 6, 15)); // 2024-07-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2404);
    });

    it("should return FV2410 for dates between 2024-10-01 and 2025-06-06", () => {
      const date = new Date(Date.UTC(2025, 2, 15)); // 2025-03-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2410);
    });

    it("should return FV2504 for dates between 2025-06-06 and 2025-10-01", () => {
      const date = new Date(Date.UTC(2025, 7, 15)); // 2025-08-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2504);
    });

    it("should return FV2510 for dates between 2025-10-01 and 2026-04-01", () => {
      const date = new Date(Date.UTC(2026, 1, 15)); // 2026-02-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2510);
    });

    it("should return FV2604 for dates between 2026-04-01 and 2026-10-01", () => {
      const date = new Date(Date.UTC(2026, 6, 15)); // 2026-07-15
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2604);
    });

    it("should return FV2610 for dates after 2026-10-01", () => {
      const date = new Date(Date.UTC(2030, 0, 1)); // 2030-01-01
      expect(getEdifactFormatVersion(date)).toBe(EdifactFormatVersion.FV2610);
    });

    // The cutover is midnight Berlin time, which in October is CEST (UTC+2),
    // so the instant is 2026-09-30T22:00:00Z — not 2026-10-01T00:00:00Z.
    it("should switch to FV2610 exactly at midnight Berlin on 2026-10-01", () => {
      const justBefore = new Date("2026-09-30T21:59:59Z");
      const atCutover = new Date("2026-09-30T22:00:00Z");
      expect(getEdifactFormatVersion(justBefore)).toBe(EdifactFormatVersion.FV2604);
      expect(getEdifactFormatVersion(atCutover)).toBe(EdifactFormatVersion.FV2610);
    });
  });

  describe("getCurrentEdifactFormatVersion", () => {
    it("should return a valid EdifactFormatVersion", () => {
      const version = getCurrentEdifactFormatVersion();
      expect(Object.values(EdifactFormatVersion)).toContain(version);
    });

    it("should return consistent results when called multiple times", () => {
      const version1 = getCurrentEdifactFormatVersion();
      const version2 = getCurrentEdifactFormatVersion();
      expect(version1).toBe(version2);
    });
  });
});
