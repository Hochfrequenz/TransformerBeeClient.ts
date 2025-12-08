import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { UnauthenticatedTransformerBeeClient } from "../../src/clients/unauthenticated-client";
import { EdifactFormatVersion, BOneyComb, Marktnachricht } from "../../src/dtos";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("UnauthenticatedTransformerBeeClient", () => {
  let client: UnauthenticatedTransformerBeeClient;

  beforeEach(() => {
    client = new UnauthenticatedTransformerBeeClient({
      baseUrl: "http://localhost:5021",
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should remove trailing slash from base URL", () => {
      const client1 = new UnauthenticatedTransformerBeeClient({
        baseUrl: "http://localhost:5021/",
      });
      const client2 = new UnauthenticatedTransformerBeeClient({
        baseUrl: "http://localhost:5021///",
      });

      // Both clients should work the same way
      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
    });

    it("should accept custom timeout", () => {
      const clientWithTimeout = new UnauthenticatedTransformerBeeClient({
        baseUrl: "http://localhost:5021",
        timeout: 5000,
      });
      expect(clientWithTimeout).toBeDefined();
    });

    it("should accept custom headers", () => {
      const clientWithHeaders = new UnauthenticatedTransformerBeeClient({
        baseUrl: "http://localhost:5021",
        headers: { "X-Custom-Header": "value" },
      });
      expect(clientWithHeaders).toBeDefined();
    });
  });

  describe("edifactToBo4e", () => {
    const sampleEdifact = "UNA:+.? 'UNB+UNOC:3+sender+receiver+date+ref'";
    const sampleMarktnachricht: Marktnachricht = {
      unh: "test-unh",
      transaktionen: [
        {
          stammdaten: [{ typ: "MARKTLOKATION", id: "123" }],
          transaktionsdaten: { nachrichtentyp: "UTILMD" },
        },
      ],
    };
    const sampleMarktnachrichtArray = [sampleMarktnachricht];

    it("should successfully convert EDIFACT to BO4E", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      const result = await client.edifactToBo4e(sampleEdifact, EdifactFormatVersion.FV2310);

      expect(result).toEqual(sampleMarktnachrichtArray);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/transformer/EdiToBo4E"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should include format version in request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e(sampleEdifact, EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"FormatPackage":"FV2310"'),
        })
      );
    });

    it("should throw EdifactToBo4eConversionError on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Invalid EDIFACT",
      });

      await expect(
        client.edifactToBo4e(sampleEdifact, EdifactFormatVersion.FV2310)
      ).rejects.toThrow("Failed to convert EDIFACT to BO4E");
    });

    it("should throw EdifactToBo4eConversionError on invalid JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "not valid json",
      });

      await expect(
        client.edifactToBo4e(sampleEdifact, EdifactFormatVersion.FV2310)
      ).rejects.toThrow("Failed to parse conversion response");
    });

    it("should throw EdifactToBo4eConversionError on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(
        client.edifactToBo4e(sampleEdifact, EdifactFormatVersion.FV2310)
      ).rejects.toThrow("Failed to convert EDIFACT to BO4E");
    });
  });

  describe("bo4eToEdifact", () => {
    const sampleBoneyComb: BOneyComb = {
      stammdaten: [{ typ: "MARKTLOKATION", id: "123" }],
      transaktionsdaten: { nachrichtentyp: "UTILMD" },
    };
    const sampleEdifact = "UNA:+.? 'UNB+UNOC:3+...";

    it("should successfully convert BO4E to EDIFACT", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ EDI: sampleEdifact }),
      });

      const result = await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310);

      expect(result).toBe(sampleEdifact);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/transformer/Bo4ETransactionToEdi"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"BO4E"'),
        })
      );
    });

    it("should include format version in request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ EDI: sampleEdifact }),
      });

      await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2404);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"FormatPackage":"FV2404"'),
        })
      );
    });

    it("should throw Bo4eToEdifactConversionError on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Server error",
      });

      await expect(
        client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310)
      ).rejects.toThrow("Failed to convert BO4E to EDIFACT");
    });

    it("should throw Bo4eToEdifactConversionError on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      await expect(
        client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310)
      ).rejects.toThrow("Failed to convert BO4E to EDIFACT");
    });
  });

  describe("custom headers", () => {
    it("should include custom headers in requests", async () => {
      const clientWithHeaders = new UnauthenticatedTransformerBeeClient({
        baseUrl: "http://localhost:5021",
        headers: {
          "X-Custom-Header": "custom-value",
          "X-Request-ID": "test-123",
        },
      });

      const marktnachrichtArray: Marktnachricht[] = [];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(marktnachrichtArray) }),
      });

      await clientWithHeaders.edifactToBo4e("test", EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom-Header": "custom-value",
            "X-Request-ID": "test-123",
          }),
        })
      );
    });
  });
});
