import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AuthenticatedTransformerBeeClient } from "../../src/clients/authenticated-client";
import {
  EdifactFormatVersion,
  BOneyComb,
  AuthenticationError,
  Marktnachricht,
} from "../../src/dtos";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AuthenticatedTransformerBeeClient", () => {
  let client: AuthenticatedTransformerBeeClient;

  const defaultConfig = {
    baseUrl: "https://transformer.utilibee.io",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
  };

  const mockTokenResponse = {
    access_token: "mock-access-token",
    token_type: "Bearer",
    expires_in: 3600,
  };

  const sampleBoneyComb: BOneyComb = {
    stammdaten: [],
    transaktionsdaten: {},
  };

  const sampleMarktnachrichtArray: Marktnachricht[] = [{ transaktionen: [sampleBoneyComb] }];

  beforeEach(() => {
    client = new AuthenticatedTransformerBeeClient(defaultConfig);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should accept required configuration", () => {
      const testClient = new AuthenticatedTransformerBeeClient(defaultConfig);
      expect(testClient).toBeDefined();
    });

    it("should accept custom token endpoint", () => {
      const testClient = new AuthenticatedTransformerBeeClient({
        ...defaultConfig,
        tokenEndpoint: "https://custom-auth.example.com/token",
      });
      expect(testClient).toBeDefined();
    });

    it("should accept custom scope", () => {
      const testClient = new AuthenticatedTransformerBeeClient({
        ...defaultConfig,
        scope: "custom-scope",
      });
      expect(testClient).toBeDefined();
    });
  });

  describe("token acquisition", () => {
    it("should acquire token before making API request", async () => {
      // Mock token endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      // Mock API endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test", EdifactFormatVersion.FV2310);

      // First call should be to token endpoint
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("token"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        })
      );

      // Second call should be to API with Authorization header
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      );
    });

    it("should reuse valid token for subsequent requests", async () => {
      // Mock token endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      // Mock two API requests
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test1", EdifactFormatVersion.FV2310);
      await client.edifactToBo4e("test2", EdifactFormatVersion.FV2310);

      // Token endpoint should only be called once
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 token + 2 API calls
    });

    it("should refresh token when expired", async () => {
      // First token acquisition
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTokenResponse, expires_in: 60 }), // 60 second expiry
      });

      // First API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test1", EdifactFormatVersion.FV2310);

      // Advance time past token expiry (need to account for 60 second buffer)
      vi.advanceTimersByTime(61 * 1000); // 61 seconds

      // Second token acquisition (after expiry)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockTokenResponse,
          access_token: "new-token",
        }),
      });

      // Second API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test2", EdifactFormatVersion.FV2310);

      // Token endpoint should be called twice
      expect(mockFetch).toHaveBeenCalledTimes(4); // 2 tokens + 2 API calls
    });

    it("should throw AuthenticationError on token acquisition failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Invalid credentials",
      });

      await expect(client.edifactToBo4e("test", EdifactFormatVersion.FV2310)).rejects.toThrow(
        AuthenticationError
      );
    });

    it("should throw AuthenticationError when token response missing access_token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token_type: "Bearer" }), // Missing access_token
      });

      await expect(client.edifactToBo4e("test", EdifactFormatVersion.FV2310)).rejects.toThrow(
        "Token response missing access_token"
      );
    });
  });

  describe("clearToken", () => {
    it("should force new token acquisition after clearing", async () => {
      // First token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test1", EdifactFormatVersion.FV2310);

      // Clear token
      client.clearToken();

      // Second token (should be acquired again)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockTokenResponse,
          access_token: "new-token-after-clear",
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ BO4E: JSON.stringify(sampleMarktnachrichtArray) }),
      });

      await client.edifactToBo4e("test2", EdifactFormatVersion.FV2310);

      // Token endpoint should be called twice
      expect(mockFetch).toHaveBeenCalledTimes(4); // 2 tokens + 2 API calls
    });
  });

  describe("bo4eToEdifact with authentication", () => {
    it("should include authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ EDI: "UNA:+.? '..." }),
      });

      await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310);

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("/v1/transformer/Bo4ETransactionToEdi"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      );
    });
  });
});
