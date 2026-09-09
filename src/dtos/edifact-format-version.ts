export {
  EdifactFormatVersion,
  getEdifactFormatVersion,
  getCurrentEdifactFormatVersion,
} from "@hochfrequenz/efoli";

import { EdifactFormatVersion } from "@hochfrequenz/efoli";

/**
 * Gets the human-readable description for an EDIFACT format version.
 * @param version - The format version
 * @returns A human-readable description of the version
 */
export function getFormatVersionDescription(version: EdifactFormatVersion): string {
  const descriptions: Record<EdifactFormatVersion, string> = {
    [EdifactFormatVersion.FV2104]: "MIG/AHB versions valid from 2021-04-01 until 2021-10-01",
    [EdifactFormatVersion.FV2110]: "MIG/AHB versions valid from 2021-10-01 until 2022-10-01",
    [EdifactFormatVersion.FV2210]: "MIG/AHB versions valid from 2022-10-01 onwards (MaKo 2022)",
    [EdifactFormatVersion.FV2304]: "MIG/AHB versions valid from 2023-04-01 onwards",
    [EdifactFormatVersion.FV2310]: "MIG/AHB versions valid from 2023-10-01 onwards",
    [EdifactFormatVersion.FV2404]: "MIG/AHB versions valid from 2024-04-03 onwards",
    [EdifactFormatVersion.FV2410]: "MIG/AHB versions valid from 2024-10-01 onwards",
    [EdifactFormatVersion.FV2504]: "MIG/AHB versions valid from 2025-06-06 onwards",
    [EdifactFormatVersion.FV2510]: "MIG/AHB versions valid from 2025-10-01 onwards",
    [EdifactFormatVersion.FV2604]: "MIG/AHB versions valid from 2026-04-01 onwards",
    [EdifactFormatVersion.FV2610]: "MIG/AHB versions valid from 2026-10-01 onwards",
  };
  return descriptions[version];
}

/**
 * Parses a string to an EdifactFormatVersion.
 * @param value - The string to parse
 * @returns The corresponding EdifactFormatVersion
 * @throws Error if the string does not match a valid version
 */
export function parseEdifactFormatVersion(value: string): EdifactFormatVersion {
  if (Object.values(EdifactFormatVersion).includes(value as EdifactFormatVersion)) {
    return value as EdifactFormatVersion;
  }
  const validVersions = Object.values(EdifactFormatVersion).join(", ");
  throw new Error(`Invalid EDIFACT format version: '${value}'. Valid values are: ${validVersions}`);
}
