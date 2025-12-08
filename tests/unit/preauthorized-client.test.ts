import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { PreauthorizedTransformerBeeClient } from "../../src/clients/preauthorized-client";
import { EdifactFormatVersion, BOneyComb, Marktnachricht } from "../../src/dtos";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("PreauthorizedTransformerBeeClient", () => {
  let client: PreauthorizedTransformerBeeClient;

  const defaultConfig = {
    baseUrl: "https://transformer.utilibee.io",
    authorizationHeader: "Bearer pre-acquired-token-12345",
  };

  const sampleBoneyComb: BOneyComb = {
    stammdaten: [],
    transaktionsdaten: {},
  };

  const sampleMarktnachrichtArray: Marktnachricht[] = [{ transaktionen: [sampleBoneyComb] }];

  beforeEach(() => {
    client = new PreauthorizedTransformerBeeClient(defaultConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should accept required configuration", () => {
      const testClient = new PreauthorizedTransformerBeeClient(defaultConfig);
      expect(testClient).toBeDefined();
    });

    it("should accept Bearer token authorization header", () => {
      const testClient = new PreauthorizedTransformerBeeClient({
        baseUrl: "https://transformer.utilibee.io",
        authorizationHeader: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      });
      expect(testClient).toBeDefined();
    });

    it("should accept Basic auth authorization header", () => {
      const testClient = new PreauthorizedTransformerBeeClient({
        baseUrl: "https://transformer.utilibee.io",
        authorizationHeader: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
      });
      expect(testClient).toBeDefined();
    });

    it("should accept custom headers alongside authorization", () => {
      const testClient = new PreauthorizedTransformerBeeClient({
        ...defaultConfig,
        headers: { "X-Custom-Header": "custom-value" },
      });
      expect(testClient).toBeDefined();
    });
  });

  describe("edifactToBo4e", () => {
    it("should include authorization header in request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test-edifact", EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer pre-acquired-token-12345",
          }),
        })
      );
    });

    it("should make request to correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test-edifact", EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/transformer/EdiToBo4E"),
        expect.anything()
      );
    });

    it("should include format version in request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test-edifact", EdifactFormatVersion.FV2404);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"FormatPackage":"FV2404"'),
        })
      );
    });
  });

  describe("bo4eToEdifact", () => {
    it("should include authorization header in request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ EDI: "UNA:+.? '..." }),
      });

      await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer pre-acquired-token-12345",
          }),
        })
      );
    });

    it("should make request to correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ EDI: "UNA:+.? '..." }),
      });

      await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/transformer/Bo4ETransactionToEdi"),
        expect.anything()
      );
    });
  });

  describe("with Basic auth", () => {
    it("should use Basic auth header correctly", async () => {
      const basicClient = new PreauthorizedTransformerBeeClient({
        baseUrl: "https://transformer.utilibee.io",
        authorizationHeader: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await basicClient.edifactToBo4e("test", EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
          }),
        })
      );
    });
  });

  describe("with custom headers", () => {
    it("should include both custom headers and authorization", async () => {
      const clientWithHeaders = new PreauthorizedTransformerBeeClient({
        ...defaultConfig,
        headers: { "X-Request-ID": "test-123" },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await clientWithHeaders.edifactToBo4e("test", EdifactFormatVersion.FV2310);

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders).toMatchObject({
        Authorization: "Bearer pre-acquired-token-12345",
        "X-Request-ID": "test-123",
      });
    });
  });
});
