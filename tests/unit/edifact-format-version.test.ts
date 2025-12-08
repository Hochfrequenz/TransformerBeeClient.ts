import { describe, it, expect } from "vitest";

import {
  EdifactFormatVersion,
  getFormatVersionDescription,
  parseEdifactFormatVersion,
} from "../../src/models/edifact-format-version";

describe("EdifactFormatVersion", () => {
  describe("enum values", () => {
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
  });

  describe("getFormatVersionDescription", () => {
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
      expect(description).toContain("2025-04-01");
    });
  });

  describe("parseEdifactFormatVersion", () => {
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
});
