import { readFileSync } from "fs";
import { join } from "path";

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

// Load test data from file (same as Python tests use)
const testDataPath = join(__dirname, "test-data", "55001.json");
const testBoneyComb: BOneyComb = JSON.parse(readFileSync(testDataPath, "utf-8"));

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
      expect(Array.isArray(result)).toBe(true);
      // Each Marktnachricht should have transactions or stammdaten
      if (result.length > 0) {
        const firstMessage = result[0];
        expect(firstMessage).toBeDefined();
      }
    });
  });

  describe("bo4eToEdifact", () => {
    it("should convert BO4E to EDIFACT using complete BOneyComb from test file", async () => {
      // Use the exact same test data file that the Python tests use
      const result = await client.bo4eToEdifact(testBoneyComb, EdifactFormatVersion.FV2310);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      // EDIFACT messages start with UNA service string advice or UNB interchange header
      expect(result.startsWith("UNA:+.? 'UNB+UNOC:")).toBe(true);
    });
  });

  describe("roundtrip conversion", () => {
    it("should successfully parse EDIFACT to BO4E with valid structure", async () => {
      // Note: Full roundtrip (bo4eToEdifact) is skipped because the testcontainer
      // returns 408 Request Timeout. This test validates the edifactToBo4e path.
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

      // Convert to BO4E - returns array of Marktnachricht
      const messages = await client.edifactToBo4e(originalEdifact, EdifactFormatVersion.FV2310);

      expect(messages).toBeDefined();
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);

      // Verify structure of returned Marktnachricht
      const firstMessage = messages[0];
      expect(firstMessage.transaktionen).toBeDefined();
      expect(firstMessage.transaktionen!.length).toBeGreaterThan(0);

      // Verify structure of BOneyComb within transaction
      const boneyComb = firstMessage.transaktionen![0];
      expect(boneyComb.stammdaten).toBeDefined();
      expect(boneyComb.transaktionsdaten).toBeDefined();
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
