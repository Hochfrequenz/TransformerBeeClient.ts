import { describe, it, expect } from "vitest";

import {
  TransformerBeeError,
  AuthenticationError,
  ApiError,
  EdifactToBo4eConversionError,
  Bo4eToEdifactConversionError,
  NetworkError,
  TimeoutError,
} from "../../src/dtos/errors";

describe("Error classes", () => {
  describe("TransformerBeeError", () => {
    it("should be an instance of Error", () => {
      const error = new TransformerBeeError("test message");
      expect(error).toBeInstanceOf(Error);
    });

    it("should have correct name", () => {
      const error = new TransformerBeeError("test message");
      expect(error.name).toBe("TransformerBeeError");
    });

    it("should have correct message", () => {
      const error = new TransformerBeeError("test message");
      expect(error.message).toBe("test message");
    });
  });

  describe("AuthenticationError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new AuthenticationError("auth failed");
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new AuthenticationError("auth failed");
      expect(error.name).toBe("AuthenticationError");
    });
  });

  describe("ApiError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new ApiError("api error", 500);
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new ApiError("api error", 500);
      expect(error.name).toBe("ApiError");
    });

    it("should store status code", () => {
      const error = new ApiError("api error", 404);
      expect(error.statusCode).toBe(404);
    });

    it("should store response body", () => {
      const error = new ApiError("api error", 500, '{"error": "details"}');
      expect(error.responseBody).toBe('{"error": "details"}');
    });

    it("should handle undefined response body", () => {
      const error = new ApiError("api error", 500);
      expect(error.responseBody).toBeUndefined();
    });
  });

  describe("EdifactToBo4eConversionError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new EdifactToBo4eConversionError("conversion failed", "UNA:...");
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new EdifactToBo4eConversionError("conversion failed", "UNA:...");
      expect(error.name).toBe("EdifactToBo4eConversionError");
    });

    it("should store the edifact message", () => {
      const edifact = "UNA:+.? 'UNB+UNOC:3+...";
      const error = new EdifactToBo4eConversionError("conversion failed", edifact);
      expect(error.edifact).toBe(edifact);
    });
  });

  describe("Bo4eToEdifactConversionError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new Bo4eToEdifactConversionError("conversion failed", {});
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new Bo4eToEdifactConversionError("conversion failed", {});
      expect(error.name).toBe("Bo4eToEdifactConversionError");
    });

    it("should store the boneyComb object", () => {
      const boneyComb = { stammdaten: [], transaktionsdaten: {} };
      const error = new Bo4eToEdifactConversionError("conversion failed", boneyComb);
      expect(error.boneyComb).toEqual(boneyComb);
    });
  });

  describe("NetworkError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new NetworkError("network failed");
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new NetworkError("network failed");
      expect(error.name).toBe("NetworkError");
    });

    it("should store the cause", () => {
      const cause = new Error("original error");
      const error = new NetworkError("network failed", cause);
      expect(error.cause).toBe(cause);
    });

    it("should handle undefined cause", () => {
      const error = new NetworkError("network failed");
      expect(error.cause).toBeUndefined();
    });
  });

  describe("TimeoutError", () => {
    it("should be an instance of TransformerBeeError", () => {
      const error = new TimeoutError("request timed out");
      expect(error).toBeInstanceOf(TransformerBeeError);
    });

    it("should have correct name", () => {
      const error = new TimeoutError("request timed out");
      expect(error.name).toBe("TimeoutError");
    });
  });
});
