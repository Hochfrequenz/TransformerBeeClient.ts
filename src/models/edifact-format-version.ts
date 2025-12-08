/**
 * Enumeration of EDIFACT format versions used in German energy market communication.
 * Each version corresponds to MIG/AHB versions valid from a specific date.
 *
 * The naming convention is FVyyMM where yy is the year and MM is the month.
 */
export enum EdifactFormatVersion {
  /** Format version valid since 2023-04-01 */
  FV2304 = "FV2304",
  /** Format version valid since 2023-10-01 */
  FV2310 = "FV2310",
  /** Format version valid since 2404-04-01 */
  FV2404 = "FV2404",
  /** Format version valid since 2024-10-01 */
  FV2410 = "FV2410",
  /** Format version valid since 2025-04-01 */
  FV2504 = "FV2504",
}

/**
 * Gets the human-readable description for an EDIFACT format version.
 * @param version - The format version
 * @returns A human-readable description of the version
 */
export function getFormatVersionDescription(version: EdifactFormatVersion): string {
  const descriptions: Record<EdifactFormatVersion, string> = {
    [EdifactFormatVersion.FV2304]: "MIG/AHB versions valid since 2023-04-01",
    [EdifactFormatVersion.FV2310]: "MIG/AHB versions valid since 2023-10-01",
    [EdifactFormatVersion.FV2404]: "MIG/AHB versions valid since 2024-04-01",
    [EdifactFormatVersion.FV2410]: "MIG/AHB versions valid since 2024-10-01",
    [EdifactFormatVersion.FV2504]: "MIG/AHB versions valid since 2025-04-01",
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
