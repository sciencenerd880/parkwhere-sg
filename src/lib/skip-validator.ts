/**
 * Maximum allowed `$skip` value for the LTA DataMall CarParkAvailabilityv2
 * endpoint. LTA's dataset contains roughly 2,600 records, paginated 500/call
 * via `$skip`, so a hard cap of 5,000 leaves headroom for growth while
 * preventing a caller from requesting pages far beyond the dataset.
 *
 * Exported for tests.
 */
export const MAX_SKIP = 5000

/**
 * Parse and validate the LTA `$skip` query parameter.
 *
 * Returns a clamped integer in `[0, MAX_SKIP]`. Anything non-numeric,
 * negative, or absurdly large collapses to `0`. Crucially this rejects
 * string-injection attempts (e.g. `0&$filter=...`, `0#/../OtherEndpoint`)
 * because `Number.parseInt` stops at the first non-numeric character.
 */
export function parseSkip(raw: string | null | undefined): number {
  if (raw == null) return 0
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(n, MAX_SKIP)
}