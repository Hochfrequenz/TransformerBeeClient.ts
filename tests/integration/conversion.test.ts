import { StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  AuthenticatedTransformerBeeClient,
  BOneyComb,
  EdifactFormatVersion,
  TransformerBeeClient,
  UnauthenticatedTransformerBeeClient,
} from "../../src";

import { getTransformerBeeUrl, startTransformerBeeContainer } from "./transformer-bee-container";

/**
 * Integration tests for transformer.bee client.
 *
 * These tests use testcontainers to spin up a transformer.bee instance.
 * Make sure Docker is running before executing these tests.
 *
 * To run integration tests:
 * npm run test:integration
 */

describe("Integration Tests with Testcontainers", () => {
  let container: StartedTestContainer;
  let client: TransformerBeeClient;

  beforeAll(async () => {
    container = await startTransformerBeeContainer();
    const baseUrl = getTransformerBeeUrl(container);

    client = new UnauthenticatedTransformerBeeClient({
      baseUrl,
    });
  }, 120000); // 2 minute timeout for container startup

  afterAll(async () => {
    await container?.stop();
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
      const result = await client.edifactToBo4e(sampleUtilmdEdifact, EdifactFormatVersion.FV2310);

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
      const result = await client.bo4eToEdifact(sampleBoneyComb, EdifactFormatVersion.FV2310);

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
      const boneyComb = await client.edifactToBo4e(originalEdifact, EdifactFormatVersion.FV2310);

      expect(boneyComb).toBeDefined();

      // Convert back to EDIFACT
      const resultEdifact = await client.bo4eToEdifact(boneyComb, EdifactFormatVersion.FV2310);

      expect(resultEdifact).toBeDefined();
      expect(typeof resultEdifact).toBe("string");

      // The resulting EDIFACT should be valid (starts with UNA or UNB)
      expect(resultEdifact.startsWith("UNA") || resultEdifact.startsWith("UNB")).toBe(true);
    });
  });
});

// Always run these basic smoke tests (no container needed)
describe("Client instantiation", () => {
  it("should create UnauthenticatedTransformerBeeClient", () => {
    const testClient = new UnauthenticatedTransformerBeeClient({
      baseUrl: "http://localhost:5021",
    });
    expect(testClient).toBeDefined();
  });

  it("should create AuthenticatedTransformerBeeClient", () => {
    const testClient = new AuthenticatedTransformerBeeClient({
      baseUrl: "https://transformer.utilibee.io",
      clientId: "test-id",
      clientSecret: "test-secret",
    });
    expect(testClient).toBeDefined();
  });
});
