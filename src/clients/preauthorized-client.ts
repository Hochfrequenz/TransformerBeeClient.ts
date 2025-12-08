import { PreauthorizedClientConfig } from "./types";
import { UnauthenticatedTransformerBeeClient } from "./unauthenticated-client";

/**
 * A client for the transformer.bee API using a pre-provided authorization header.
 *
 * Use this client when you already have an authorization token or want to use
 * a custom authentication scheme (e.g., Basic auth, API key, or a pre-acquired Bearer token).
 *
 * Unlike AuthenticatedTransformerBeeClient, this client does not handle token
 * acquisition or refresh - you are responsible for providing a valid authorization header.
 *
 * @example
 * ```typescript
 * // Using a pre-acquired Bearer token
 * const client = new PreauthorizedTransformerBeeClient({
 *   baseUrl: "https://transformer.utilibee.io",
 *   authorizationHeader: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 * });
 *
 * // Using Basic auth
 * const client = new PreauthorizedTransformerBeeClient({
 *   baseUrl: "https://transformer.utilibee.io",
 *   authorizationHeader: "Basic dXNlcm5hbWU6cGFzc3dvcmQ="
 * });
 *
 * const boneyComb = await client.edifactToBo4e(edifactMessage, EdifactFormatVersion.FV2310);
 * ```
 */
export class PreauthorizedTransformerBeeClient extends UnauthenticatedTransformerBeeClient {
  private readonly authorizationHeader: string;

  /**
   * Creates a new preauthorized transformer.bee client.
   *
   * @param config - The client configuration including the authorization header
   */
  constructor(config: PreauthorizedClientConfig) {
    super(config);
    this.authorizationHeader = config.authorizationHeader;
  }

  /**
   * Gets the headers to include in requests, adding the authorization header.
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- async for interface compatibility
  protected override async getHeaders(): Promise<Record<string, string>> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.customHeaders,
      Authorization: this.authorizationHeader,
    };
  }
}
