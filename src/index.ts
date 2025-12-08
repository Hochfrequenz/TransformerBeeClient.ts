/**
 * transformer-bee-client
 *
 * An async TypeScript/JavaScript client for transformer.bee aka edifact-bo4e-converter.
 *
 * This library allows you to convert EDIFACT messages to BO4E and vice versa
 * by communicating with Hochfrequenz's transformer.bee service.
 *
 * @example
 * ```typescript
 * // Unauthenticated client (for local development)
 * import {
 *   UnauthenticatedTransformerBeeClient,
 *   EdifactFormatVersion
 * } from "transformer-bee-client";
 *
 * const client = new UnauthenticatedTransformerBeeClient({
 *   baseUrl: "http://localhost:5021"
 * });
 *
 * const boneyComb = await client.edifactToBo4e(edifactMessage, EdifactFormatVersion.FV2310);
 * ```
 *
 * @example
 * ```typescript
 * // Authenticated client (for production)
 * import {
 *   AuthenticatedTransformerBeeClient,
 *   EdifactFormatVersion
 * } from "transformer-bee-client";
 *
 * const client = new AuthenticatedTransformerBeeClient({
 *   baseUrl: "https://transformer.utilibee.io",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret"
 * });
 *
 * const edifact = await client.bo4eToEdifact(boneyComb, EdifactFormatVersion.FV2310);
 * ```
 *
 * @packageDocumentation
 */

// Export models
export {
  EdifactFormatVersion,
  getFormatVersionDescription,
  parseEdifactFormatVersion,
  type BOneyComb,
  type Bo4eObject,
  type Transaktionsdaten,
  BOneyCombSchema,
  Bo4eObjectSchema,
  TransaktionsdatenSchema,
  parseBOneyComb,
  safeParseBOneyComb,
  createEmptyBOneyComb,
  TransformerBeeError,
  AuthenticationError,
  ApiError,
  EdifactToBo4eConversionError,
  Bo4eToEdifactConversionError,
  NetworkError,
  TimeoutError,
} from "./models";

// Export clients
export {
  type TransformerBeeClient,
  type TransformerBeeClientConfig,
  type AuthenticatedClientConfig,
  type TokenResponse,
  UnauthenticatedTransformerBeeClient,
  AuthenticatedTransformerBeeClient,
} from "./clients";
