import { describe, it, expect } from "vitest";

import {
  BOneyComb,
  BOneyCombSchema,
  createEmptyBOneyComb,
  parseBOneyComb,
  safeParseBOneyComb,
} from "../../src/dtos/boney-comb";

describe("BOneyComb", () => {
  describe("BOneyCombSchema", () => {
    it("should validate a valid BOneyComb object", () => {
      const validData: BOneyComb = {
        stammdaten: [
          { typ: "MARKTLOKATION", marktlokationsId: "51238696781" },
          { typ: "GESCHAEFTSPARTNER", name: "Test GmbH" },
        ],
        transaktionsdaten: {
          nachrichtentyp: "UTILMD",
          pruefidentifikator: "11042",
        },
      };

      const result = BOneyCombSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate an empty BOneyComb", () => {
      const emptyData: BOneyComb = {
        stammdaten: [],
        transaktionsdaten: {},
      };

      const result = BOneyCombSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
    });

    it("should reject missing stammdaten", () => {
      const invalidData = {
        transaktionsdaten: {},
      };

      const result = BOneyCombSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing transaktionsdaten", () => {
      const invalidData = {
        stammdaten: [],
      };

      const result = BOneyCombSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject null values", () => {
      const invalidData = null;

      const result = BOneyCombSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject string instead of object", () => {
      const invalidData = "not an object";

      const result = BOneyCombSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("parseBOneyComb", () => {
    it("should parse valid data", () => {
      const validData = {
        stammdaten: [{ id: "123" }],
        transaktionsdaten: { type: "test" },
      };

      const result = parseBOneyComb(validData);

      expect(result.stammdaten).toHaveLength(1);
      expect(result.transaktionsdaten).toEqual({ type: "test" });
    });

    it("should throw on invalid data", () => {
      const invalidData = { stammdaten: "not an array" };

      expect(() => parseBOneyComb(invalidData)).toThrow();
    });
  });

  describe("safeParseBOneyComb", () => {
    it("should return success for valid data", () => {
      const validData = {
        stammdaten: [],
        transaktionsdaten: {},
      };

      const result = safeParseBOneyComb(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should return failure for invalid data", () => {
      const invalidData = { invalid: true };

      const result = safeParseBOneyComb(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("createEmptyBOneyComb", () => {
    it("should create an empty BOneyComb", () => {
      const result = createEmptyBOneyComb();

      expect(result.stammdaten).toEqual([]);
      expect(result.transaktionsdaten).toEqual({});
    });

    it("should be valid according to schema", () => {
      const result = createEmptyBOneyComb();
      const validation = BOneyCombSchema.safeParse(result);

      expect(validation.success).toBe(true);
    });
  });
});
