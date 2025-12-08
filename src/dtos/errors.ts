/**
 * Base error class for all transformer.bee client errors.
 */
export class TransformerBeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransformerBeeError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when authentication fails.
 */
export class AuthenticationError extends TransformerBeeError {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when the API returns an error response.
 */
export class ApiError extends TransformerBeeError {
  public readonly statusCode: number;
  public readonly responseBody: string | undefined;

  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Error thrown when the conversion from EDIFACT to BO4E fails.
 */
export class EdifactToBo4eConversionError extends TransformerBeeError {
  public readonly edifact: string;

  constructor(message: string, edifact: string) {
    super(message);
    this.name = "EdifactToBo4eConversionError";
    this.edifact = edifact;
  }
}

/**
 * Error thrown when the conversion from BO4E to EDIFACT fails.
 */
export class Bo4eToEdifactConversionError extends TransformerBeeError {
  public readonly boneyComb: unknown;

  constructor(message: string, boneyComb: unknown) {
    super(message);
    this.name = "Bo4eToEdifactConversionError";
    this.boneyComb = boneyComb;
  }
}

/**
 * Error thrown when a network request fails.
 */
export class NetworkError extends TransformerBeeError {
  public override readonly cause: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

/**
 * Error thrown when a request times out.
 */
export class TimeoutError extends TransformerBeeError {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}
