import { AuthenticationError, NetworkError } from "../dtos";

import { AuthenticatedClientConfig, StoredToken, TokenResponse } from "./types";
import { UnauthenticatedTransformerBeeClient } from "./unauthenticated-client";

/**
 * Default OAuth2 token endpoint for Hochfrequenz services.
 */
const DEFAULT_TOKEN_ENDPOINT =
  "https://auth.hochfrequenz.de/realms/utilibee/protocol/openid-connect/token";

/**
 * Default OAuth2 scope.
 */
const DEFAULT_SCOPE = "openid";

/**
 * Buffer time in seconds before token expiry to refresh.
 * We refresh the token 60 seconds before it expires to avoid race conditions.
 */
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * An OAuth2-authenticated client for the transformer.bee API.
 *
 * Use this client when accessing transformer.bee with Hochfrequenz-provided
 * client credentials (client ID and client secret).
 *
 * The client automatically handles token acquisition and refresh.
 *
 * @example
 * ```typescript
 * const client = new AuthenticatedTransformerBeeClient({
 *   baseUrl: "https://transformer.utilibee.io",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret"
 * });
 *
 * const boneyComb = await client.edifactToBo4e(edifactMessage, EdifactFormatVersion.FV2310);
 * ```
 */
export class AuthenticatedTransformerBeeClient extends UnauthenticatedTransformerBeeClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tokenEndpoint: string;
  private readonly scope: string;
  private storedToken: StoredToken | null = null;

  /**
   * Creates a new OAuth2-authenticated transformer.bee client.
   *
   * @param config - The client configuration including OAuth2 credentials
   */
  constructor(config: AuthenticatedClientConfig) {
    super(config);
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tokenEndpoint = config.tokenEndpoint ?? DEFAULT_TOKEN_ENDPOINT;
    this.scope = config.scope ?? DEFAULT_SCOPE;
  }

  /**
   * Checks if the stored token is still valid.
   */
  private isTokenValid(): boolean {
    if (!this.storedToken) {
      return false;
    }

    const now = new Date();
    const bufferMs = TOKEN_EXPIRY_BUFFER_SECONDS * 1000;
    return this.storedToken.expiresAt.getTime() - bufferMs > now.getTime();
  }

  /**
   * Acquires a new access token using the client credentials flow.
   */
  private async acquireToken(): Promise<StoredToken> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scope,
    });

    try {
      const response = await fetch(this.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AuthenticationError(
          `Failed to acquire token: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const tokenData = (await response.json()) as TokenResponse;

      if (!tokenData.access_token) {
        throw new AuthenticationError("Token response missing access_token");
      }

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      return {
        accessToken: tokenData.access_token,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new NetworkError(`Failed to acquire token: ${error.message}`, error);
      }

      throw new AuthenticationError("Failed to acquire token: Unknown error");
    }
  }

  /**
   * Gets a valid access token, acquiring or refreshing as needed.
   */
  private async getAccessToken(): Promise<string> {
    if (!this.isTokenValid()) {
      this.storedToken = await this.acquireToken();
    }

    return this.storedToken!.accessToken;
  }

  /**
   * Gets the headers to include in requests, adding the authorization header.
   */
  protected override async getHeaders(): Promise<Record<string, string>> {
    const baseHeaders = await super.getHeaders();
    const accessToken = await this.getAccessToken();

    return {
      ...baseHeaders,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Clears the cached token, forcing a new token acquisition on the next request.
   * Useful for testing or when you know the token has been revoked.
   */
  public clearToken(): void {
    this.storedToken = null;
  }
}
