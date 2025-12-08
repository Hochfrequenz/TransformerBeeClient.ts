import { describe, it, expect, beforeAll } from "vitest";

import {
  UnauthenticatedTransformerBeeClient,
  AuthenticatedTransformerBeeClient,
  EdifactFormatVersion,
  BOneyComb,
  TransformerBeeClient,
} from "../../src";

/**
 * Integration tests for transformer.bee client.
 *
 * These tests require a running transformer.bee instance.
 * Set the following environment variables to run these tests:
 *
 * - TRANSFORMER_BEE_URL: Base URL of the transformer.bee service
 * - TRANSFORMER_BEE_CLIENT_ID: OAuth2 client ID (optional, for authenticated tests)
 * - TRANSFORMER_BEE_CLIENT_SECRET: OAuth2 client secret (optional, for authenticated tests)
 *
 * To run integration tests:
 * npm run test:integration
 */

// Skip integration tests if no URL is configured
const TRANSFORMER_BEE_URL = process.env["TRANSFORMER_BEE_URL"];
const CLIENT_ID = process.env["TRANSFORMER_BEE_CLIENT_ID"];
const CLIENT_SECRET = process.env["TRANSFORMER_BEE_CLIENT_SECRET"];

const describeIf = (condition: boolean) => (condition ? describe : describe.skip);

describeIf(!!TRANSFORMER_BEE_URL)("Integration Tests", () => {
  let client: TransformerBeeClient;

  beforeAll(() => {
    if (!TRANSFORMER_BEE_URL) {
      throw new Error("TRANSFORMER_BEE_URL environment variable is required");
    }

    // Use authenticated client if credentials are provided
    if (CLIENT_ID && CLIENT_SECRET) {
      client = new AuthenticatedTransformerBeeClient({
        baseUrl: TRANSFORMER_BEE_URL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });
    } else {
      client = new UnauthenticatedTransformerBeeClient({
        baseUrl: TRANSFORMER_BEE_URL,
      });
    }
  });

  describe("edifactToBo4e", () => {
    const sampleUtilmdEdifact = `UNA:+.? '
UNB+UNOC:3+123456789012345:500+987654321098765:500+231015:1200+00000000000001++TL'
UNH+00000000000001+UTILMD:D:11A:UN:5.2e'
BGM+E01+UTILMD00000001+9'
DTM+137:202310151200:203'
NAD+MS+123456789012345::293'
CTA+IC+:Max Mustermann'
COM+max.mustermann@example.de:EM'
NAD+MR+987654321098765::293'
IDE+24+DEMALO12345678901234567890123456789012'
DTM+92:20231015:102'
STS+7++E01'
UNT+12+00000000000001'
UNZ+1+00000000000001'`;

    it("should convert EDIFACT to BO4E", async () => {
      const result = await client.edifactToBo4e(
        sampleUtilmdEdifact,
        EdifactFormatVersion.FV2310
      );

      expect(result).toBeDefined();
      expect(result.stammdaten).toBeDefined();
      expect(result.transaktionsdaten).toBeDefined();
      expect(Array.isArray(result.stammdaten)).toBe(true);
    });
  });

  describe("bo4eToEdifact", () => {
    const sampleBoneyComb: BOneyComb = {
      stammdaten: [
        {
          boTyp: "MARKTLOKATION",
          marktlokationsId: "51238696781",
          sppisteGeraetezuordnungVorhanden: false,
          lokationsadresse: {
            postleitzahl: "82031",
            ort: "Grünwald",
            strasse: "Nördliche Münchner Straße",
            hausnummer: "27A",
            landescode: "DE",
          },
        },
      ],
      transaktionsdaten: {
        nachrichtentyp: "UTILMD",
        pruefidentifikator: "11042",
      },
    };

    it("should convert BO4E to EDIFACT", async () => {
      const result = await client.bo4eToEdifact(
        sampleBoneyComb,
        EdifactFormatVersion.FV2310
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      // EDIFACT messages typically start with UNA or UNB
      expect(result.startsWith("UNA") || result.startsWith("UNB")).toBe(true);
    });
  });

  describe("roundtrip conversion", () => {
    it("should be able to convert EDIFACT -> BO4E -> EDIFACT", async () => {
      const originalEdifact = `UNA:+.? '
UNB+UNOC:3+123456789012345:500+987654321098765:500+231015:1200+00000000000001++TL'
UNH+00000000000001+UTILMD:D:11A:UN:5.2e'
BGM+E01+UTILMD00000001+9'
DTM+137:202310151200:203'
NAD+MS+123456789012345::293'
NAD+MR+987654321098765::293'
IDE+24+DEMALO12345678901234567890123456789012'
DTM+92:20231015:102'
STS+7++E01'
UNT+10+00000000000001'
UNZ+1+00000000000001'`;

      // Convert to BO4E
      const boneyComb = await client.edifactToBo4e(
        originalEdifact,
        EdifactFormatVersion.FV2310
      );

      expect(boneyComb).toBeDefined();

      // Convert back to EDIFACT
      const resultEdifact = await client.bo4eToEdifact(
        boneyComb,
        EdifactFormatVersion.FV2310
      );

      expect(resultEdifact).toBeDefined();
      expect(typeof resultEdifact).toBe("string");

      // The resulting EDIFACT should be valid (starts with UNA or UNB)
      expect(
        resultEdifact.startsWith("UNA") || resultEdifact.startsWith("UNB")
      ).toBe(true);
    });
  });
});

// Always run these basic smoke tests
describe("Client instantiation", () => {
  it("should create UnauthenticatedTransformerBeeClient", () => {
    const client = new UnauthenticatedTransformerBeeClient({
      baseUrl: "http://localhost:5021",
    });
    expect(client).toBeDefined();
  });

  it("should create AuthenticatedTransformerBeeClient", () => {
    const client = new AuthenticatedTransformerBeeClient({
      baseUrl: "https://transformer.utilibee.io",
      clientId: "test-id",
      clientSecret: "test-secret",
    });
    expect(client).toBeDefined();
  });
});
