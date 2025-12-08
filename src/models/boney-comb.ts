import { z } from "zod";

/**
 * Schema for BO4E business objects (Stammdaten).
 * This is a flexible schema that accepts any object structure.
 */
export const Bo4eObjectSchema = z.record(z.unknown());

/**
 * Type for a BO4E business object.
 */
export type Bo4eObject = z.infer<typeof Bo4eObjectSchema>;

/**
 * Schema for transaction data (Transaktionsdaten).
 * Contains the transaction-specific data for the EDIFACT message.
 */
export const TransaktionsdatenSchema = z.record(z.unknown());

/**
 * Type for transaction data.
 */
export type Transaktionsdaten = z.infer<typeof TransaktionsdatenSchema>;

/**
 * Schema for BOneyComb - the container format for BO4E data used by transformer.bee.
 *
 * BOneyComb contains:
 * - stammdaten: An array of BO4E business objects (master data)
 * - transaktionsdaten: Transaction-specific data
 *
 * The name "BOneyComb" is a play on words combining "BO4E" (Business Objects for Energy)
 * and "honeycomb" (referencing the "bee" in transformer.bee).
 */
export const BOneyCombSchema = z.object({
  /**
   * Array of BO4E business objects (master data).
   * These represent entities like market locations, contracts, etc.
   */
  stammdaten: z.array(Bo4eObjectSchema),

  /**
   * Transaction-specific data.
   * Contains information specific to the current transaction/message.
   */
  transaktionsdaten: TransaktionsdatenSchema,
});

/**
 * BOneyComb is the container format for BO4E data used by transformer.bee.
 *
 * @example
 * ```typescript
 * const boneyComb: BOneyComb = {
 *   stammdaten: [
 *     { typ: "MARKTLOKATION", marktlokationsId: "51238696781" }
 *   ],
 *   transaktionsdaten: {
 *     nachrichtentyp: "UTILMD",
 *     pruefidentifikator: "11042"
 *   }
 * };
 * ```
 */
export type BOneyComb = z.infer<typeof BOneyCombSchema>;

/**
 * Validates and parses an unknown value into a BOneyComb.
 *
 * @param data - The data to validate and parse
 * @returns A validated BOneyComb object
 * @throws ZodError if the data doesn't match the schema
 *
 * @example
 * ```typescript
 * const data = JSON.parse(jsonString);
 * const boneyComb = parseBOneyComb(data);
 * ```
 */
export function parseBOneyComb(data: unknown): BOneyComb {
  return BOneyCombSchema.parse(data);
}

/**
 * Safely validates an unknown value into a BOneyComb.
 *
 * @param data - The data to validate
 * @returns A result object with either success: true and the data, or success: false and the error
 *
 * @example
 * ```typescript
 * const result = safeParseBOneyComb(data);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function safeParseBOneyComb(data: unknown): z.SafeParseReturnType<unknown, BOneyComb> {
  return BOneyCombSchema.safeParse(data);
}

/**
 * Creates an empty BOneyComb structure.
 *
 * @returns An empty BOneyComb with default values
 */
export function createEmptyBOneyComb(): BOneyComb {
  return {
    stammdaten: [],
    transaktionsdaten: {},
  };
}
