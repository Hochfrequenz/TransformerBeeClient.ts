import {
  ApiError,
  AuthenticationError,
  BOneyComb,
  Bo4eToEdifactConversionError,
  EdifactFormatVersion,
  EdifactToBo4eConversionError,
  Marktnachricht,
  NetworkError,
  parseMarktnachrichtArray,
  TimeoutError,
} from "../models";

import { TransformerBeeClient, TransformerBeeClientConfig } from "./types";

/**
 * Default timeout for requests in milliseconds.
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * API endpoints for transformer.bee.
 */
const API_ENDPOINTS = {
  EDIFACT_TO_BO4E: "/v1/transformer/EdiToBo4E",
  BO4E_TO_EDIFACT: "/v1/transformer/Bo4ETransactionToEdi",
} as const;

/**
 * An unauthenticated client for the transformer.bee API.
 *
 * Use this client when transformer.bee is hosted in the same network
 * or on localhost without authentication.
 *
 * @example
 * ```typescript
 * const client = new UnauthenticatedTransformerBeeClient({
 *   baseUrl: "http://localhost:5021"
 * });
 *
 * const boneyComb = await client.edifactToBo4e(edifactMessage, EdifactFormatVersion.FV2310);
 * ```
 */
export class UnauthenticatedTransformerBeeClient implements TransformerBeeClient {
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly customHeaders: Record<string, string>;

  /**
   * Creates a new unauthenticated transformer.bee client.
   *
   * @param config - The client configuration
   */
  constructor(config: TransformerBeeClientConfig) {
    // Remove trailing slash from base URL
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.customHeaders = config.headers ?? {};
  }

  /**
   * Gets the headers to include in requests.
   * Override this in subclasses to add authentication headers.
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- async for subclass override compatibility
  protected async getHeaders(): Promise<Record<string, string>> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.customHeaders,
    };
  }

  /**
   * Makes an HTTP request to the transformer.bee API.
   *
   * @param endpoint - The API endpoint
   * @param body - The request body
   * @returns The response text
   */
  protected async makeRequest(endpoint: string, body: unknown): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!response.ok) {
        throw new ApiError(
          `API request failed with status ${response.status}: ${response.statusText}`,
          response.status,
          responseText
        );
      }

      return responseText;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
        }
        throw new NetworkError(`Network request failed: ${error.message}`, error);
      }

      throw new NetworkError("Unknown network error occurred");
    }
  }

  /**
   * Converts an EDIFACT message to BO4E format.
   *
   * @param edifact - The EDIFACT message string
   * @param formatVersion - The EDIFACT format version
   * @returns A Promise resolving to an array of Marktnachricht objects
   */
  async edifactToBo4e(
    edifact: string,
    formatVersion: EdifactFormatVersion
  ): Promise<Marktnachricht[]> {
    const endpoint = API_ENDPOINTS.EDIFACT_TO_BO4E;
    const requestBody = {
      EDI: edifact,
      FormatPackage: formatVersion,
    };

    try {
      const responseText = await this.makeRequest(endpoint, requestBody);
      const responseData = JSON.parse(responseText) as { BO4E: string };

      // The API returns the Marktnachricht array as a JSON string in the BO4E field
      if (responseData.BO4E === undefined || responseData.BO4E === null) {
        throw new Error("Response missing BO4E field");
      }

      // Handle empty BO4E field
      if (responseData.BO4E === "") {
        return [];
      }

      // Parse the BO4E JSON string (replace escaped newlines)
      const bo4eJsonString = responseData.BO4E.replace(/\\n/g, "\n");
      const marktnachrichtData: unknown = JSON.parse(bo4eJsonString);
      return parseMarktnachrichtArray(marktnachrichtData);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (
        error instanceof ApiError ||
        error instanceof NetworkError ||
        error instanceof TimeoutError
      ) {
        throw new EdifactToBo4eConversionError(
          `Failed to convert EDIFACT to BO4E: ${error.message}`,
          edifact
        );
      }
      throw new EdifactToBo4eConversionError(
        `Failed to parse conversion response: ${error instanceof Error ? error.message : "Unknown error"}`,
        edifact
      );
    }
  }

  /**
   * Converts a BO4E object (BOneyComb) to EDIFACT format.
   *
   * @param boneyComb - The BOneyComb object to convert
   * @param formatVersion - The target EDIFACT format version
   * @returns A Promise resolving to the EDIFACT message string
   */
  async bo4eToEdifact(boneyComb: BOneyComb, formatVersion: EdifactFormatVersion): Promise<string> {
    const endpoint = API_ENDPOINTS.BO4E_TO_EDIFACT;
    const requestBody = {
      BO4E: JSON.stringify(boneyComb),
      FormatPackage: formatVersion,
    };

    try {
      const responseText = await this.makeRequest(endpoint, requestBody);
      const responseData = JSON.parse(responseText) as { EDI: string };

      // The API returns the EDIFACT message in the EDI field
      if (!responseData.EDI) {
        throw new Error("Response missing EDI field");
      }

      return responseData.EDI;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (
        error instanceof ApiError ||
        error instanceof NetworkError ||
        error instanceof TimeoutError
      ) {
        throw new Bo4eToEdifactConversionError(
          `Failed to convert BO4E to EDIFACT: ${error.message}`,
          boneyComb
        );
      }
      throw new Bo4eToEdifactConversionError(
        `Failed to convert BO4E to EDIFACT: ${error instanceof Error ? error.message : "Unknown error"}`,
        boneyComb
      );
    }
  }
}
