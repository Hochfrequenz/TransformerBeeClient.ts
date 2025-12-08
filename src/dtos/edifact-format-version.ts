/**
 * Enumeration of EDIFACT format versions used in German energy market communication.
 * Each version corresponds to MIG/AHB versions valid from a specific date.
 *
 * The naming convention is FVyyMM where yy is the year and MM is the month.
 */
export enum EdifactFormatVersion {
  /** Format version valid from 2021-04-01 until 2021-10-01 */
  FV2104 = "FV2104",
  /** Format version valid from 2021-10-01 until 2022-04-01 */
  FV2110 = "FV2110",
  /** Format version valid from 2022-10-01 onwards ("MaKo 2022", was 2204 previously) */
  FV2210 = "FV2210",
  /** Format version valid from 2023-04-01 onwards */
  FV2304 = "FV2304",
  /** Format version valid from 2023-10-01 onwards */
  FV2310 = "FV2310",
  /** Format version valid from 2024-04-01 onwards */
  FV2404 = "FV2404",
  /** Format version valid from 2024-10-01 onwards */
  FV2410 = "FV2410",
  /** Format version valid from 2025-06-06 onwards (was originally planned for 2025-04-04) */
  FV2504 = "FV2504",
  /** Format version valid from 2025-10-01 onwards */
  FV2510 = "FV2510",
  /** Format version valid from 2026-04-01 onwards */
  FV2604 = "FV2604",
}

/**
 * Gets the human-readable description for an EDIFACT format version.
 * @param version - The format version
 * @returns A human-readable description of the version
 */
export function getFormatVersionDescription(version: EdifactFormatVersion): string {
  const descriptions: Record<EdifactFormatVersion, string> = {
    [EdifactFormatVersion.FV2104]: "MIG/AHB versions valid from 2021-04-01 until 2021-10-01",
    [EdifactFormatVersion.FV2110]: "MIG/AHB versions valid from 2021-10-01 until 2022-04-01",
    [EdifactFormatVersion.FV2210]: "MIG/AHB versions valid from 2022-10-01 onwards (MaKo 2022)",
    [EdifactFormatVersion.FV2304]: "MIG/AHB versions valid from 2023-04-01 onwards",
    [EdifactFormatVersion.FV2310]: "MIG/AHB versions valid from 2023-10-01 onwards",
    [EdifactFormatVersion.FV2404]: "MIG/AHB versions valid from 2024-04-01 onwards",
    [EdifactFormatVersion.FV2410]: "MIG/AHB versions valid from 2024-10-01 onwards",
    [EdifactFormatVersion.FV2504]: "MIG/AHB versions valid from 2025-06-06 onwards",
    [EdifactFormatVersion.FV2510]: "MIG/AHB versions valid from 2025-10-01 onwards",
    [EdifactFormatVersion.FV2604]: "MIG/AHB versions valid from 2026-04-01 onwards",
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

/**
 * Format version thresholds in UTC.
 * Each entry is [threshold_date_utc_ms, version_before_threshold].
 * The threshold is typically 22:00 UTC the day before the stated effective date
 * (accounting for Berlin timezone being UTC+1/+2).
 */
const FORMAT_VERSION_THRESHOLDS: ReadonlyArray<readonly [number, EdifactFormatVersion]> = [
  [Date.UTC(2021, 8, 30, 22, 0, 0, 0), EdifactFormatVersion.FV2104], // Until 2021-09-30 22:00 UTC
  [Date.UTC(2022, 8, 30, 22, 0, 0, 0), EdifactFormatVersion.FV2110], // Until 2022-09-30 22:00 UTC
  [Date.UTC(2023, 2, 31, 22, 0, 0, 0), EdifactFormatVersion.FV2210], // Until 2023-03-31 22:00 UTC
  [Date.UTC(2023, 8, 30, 22, 0, 0, 0), EdifactFormatVersion.FV2304], // Until 2023-09-30 22:00 UTC
  [Date.UTC(2024, 3, 2, 22, 0, 0, 0), EdifactFormatVersion.FV2310], // Until 2024-04-02 22:00 UTC
  [Date.UTC(2024, 8, 30, 22, 0, 0, 0), EdifactFormatVersion.FV2404], // Until 2024-09-30 22:00 UTC
  [Date.UTC(2025, 5, 5, 22, 0, 0, 0), EdifactFormatVersion.FV2410], // Until 2025-06-05 22:00 UTC
  [Date.UTC(2025, 8, 30, 22, 0, 0, 0), EdifactFormatVersion.FV2504], // Until 2025-09-30 22:00 UTC
  [Date.UTC(2026, 2, 31, 22, 0, 0, 0), EdifactFormatVersion.FV2510], // Until 2026-03-31 22:00 UTC
];

/**
 * Retrieves the appropriate EDIFACT format version applicable for the given key date.
 *
 * This function determines the correct EDIFACT format version by comparing the provided key date
 * against a series of predefined datetime thresholds. Each threshold corresponds to a specific
 * version of the EDIFACT format.
 *
 * @param keyDate - The date for which the EDIFACT format version is to be determined.
 * @returns The EDIFACT format version valid for the specified key date.
 */
export function getEdifactFormatVersion(keyDate: Date): EdifactFormatVersion {
  const keyDateMs = keyDate.getTime();

  for (const [thresholdMs, version] of FORMAT_VERSION_THRESHOLDS) {
    if (keyDateMs < thresholdMs) {
      return version;
    }
  }

  return EdifactFormatVersion.FV2604;
}

/**
 * Returns the EDIFACT format version that is valid as of now.
 *
 * @returns The currently applicable EDIFACT format version.
 */
export function getCurrentEdifactFormatVersion(): EdifactFormatVersion {
  return getEdifactFormatVersion(new Date());
}
