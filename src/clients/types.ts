import { BOneyComb, EdifactFormatVersion, Marktnachricht } from "../models";

/**
 * Configuration options for the transformer.bee client.
 */
export interface TransformerBeeClientConfig {
  /**
   * The base URL of the transformer.bee service.
   * Example: "https://transformer.utilibee.io" or "http://localhost:5021"
   */
  baseUrl: string;

  /**
   * Request timeout in milliseconds. Default is 30000 (30 seconds).
   */
  timeout?: number;

  /**
   * Custom headers to include in all requests.
   */
  headers?: Record<string, string>;
}

/**
 * Configuration for OAuth2 authenticated client.
 */
export interface AuthenticatedClientConfig extends TransformerBeeClientConfig {
  /**
   * OAuth2 client ID.
   */
  clientId: string;

  /**
   * OAuth2 client secret.
   */
  clientSecret: string;

  /**
   * OAuth2 token endpoint URL.
   * If not provided, uses the default Hochfrequenz token endpoint.
   */
  tokenEndpoint?: string;

  /**
   * OAuth2 scope. If not provided, uses a default scope.
   */
  scope?: string;
}

/**
 * Configuration for client with a pre-provided authorization header.
 */
export interface PreauthorizedClientConfig extends TransformerBeeClientConfig {
  /**
   * The full Authorization header value (e.g., "Bearer <token>" or "Basic <credentials>").
   */
  authorizationHeader: string;
}

/**
 * Interface for transformer.bee API clients.
 *
 * Both authenticated and unauthenticated clients implement this interface,
 * allowing them to be used interchangeably.
 */
export interface TransformerBeeClient {
  /**
   * Converts an EDIFACT message to BO4E format.
   *
   * @param edifact - The EDIFACT message string
   * @param formatVersion - The EDIFACT format version
   * @returns A Promise resolving to an array of Marktnachricht objects
   * @throws {EdifactToBo4eConversionError} If the conversion fails
   * @throws {ApiError} If the API returns an error
   * @throws {NetworkError} If a network error occurs
   *
   * @example
   * ```typescript
   * const edifact = "UNA:+.? 'UNB+UNOC:3+...";
   * const messages = await client.edifactToBo4e(edifact, EdifactFormatVersion.FV2310);
   * // Each message contains transaktionen (list of BOneyComb)
   * const firstTransaction = messages[0].transaktionen?.[0];
   * ```
   */
  edifactToBo4e(edifact: string, formatVersion: EdifactFormatVersion): Promise<Marktnachricht[]>;

  /**
   * Converts a BO4E object (BOneyComb) to EDIFACT format.
   *
   * @param boneyComb - The BOneyComb object to convert
   * @param formatVersion - The target EDIFACT format version
   * @returns A Promise resolving to the EDIFACT message string
   * @throws {Bo4eToEdifactConversionError} If the conversion fails
   * @throws {ApiError} If the API returns an error
   * @throws {NetworkError} If a network error occurs
   *
   * @example
   * ```typescript
   * const boneyComb: BOneyComb = {
   *   stammdaten: [...],
   *   transaktionsdaten: {...}
   * };
   * const edifact = await client.bo4eToEdifact(boneyComb, EdifactFormatVersion.FV2310);
   * ```
   */
  bo4eToEdifact(boneyComb: BOneyComb, formatVersion: EdifactFormatVersion): Promise<string>;
}

/**
 * OAuth2 token response structure.
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Internal token storage with expiry tracking.
 */
export interface StoredToken {
  accessToken: string;
  expiresAt: Date;
}
