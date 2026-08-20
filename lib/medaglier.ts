import { CERTIFICATIONS, normalizeName, TIER_ORDER, type CertTier, type CertTrack } from "./certifications"
import { formatDateOnly, parseDateOnly } from "./utils"
import type { EarnedBadge } from "./credly"

export type MedalStatus = "active" | "expired" | "missing" | "retired"

export interface MedalItem {
  code: string
  name: string
  tier: CertTier
  track: CertTrack
  image: string
  status: MedalStatus
  earned: boolean
  badgeUrl: string | null
  issuedDate: string | null
  /** ISO date the certification expires, per the Credly badge record; falls back to issue date + 3 years when Credly has none. */
  expiresDate: string | null
}

export interface MedalSummary {
  total: number
  active: number
  expired: number
  missing: number
}

export function summarizeMedals(items: MedalItem[]): MedalSummary {
  return items.reduce(
    (summary, item) => {
      if (item.status === "retired") return summary

      summary.total += 1
      if (item.status === "active") summary.active += 1
      if (item.status === "expired") summary.expired += 1
      if (item.status === "missing") summary.missing += 1
      return summary
    },
    { total: 0, active: 0, expired: 0, missing: 0 },
  )
}

// Fallback when Credly's badge record carries no expiry: AWS certifications
// are valid for 3 years from the date they are earned.
const VALIDITY_YEARS = 3

function computeExpiry(issued: string | null): string | null {
  if (!issued) return null
  const date = parseDateOnly(issued)
  if (!date) return null
  date.setFullYear(date.getFullYear() + VALIDITY_YEARS)
  return formatDateOnly(date)
}

/**
 * Merges the official AWS certification list with the badges earned on Credly.
 * A certification is "active" when a matching Credly badge exists and its
 * expiration date (taken from the Credly badge record, or issue date + 3
 * years as a fallback) has not elapsed; "expired" once it has; "missing"
 * when no badge matches.
 * Returns items sorted: active (most recent first), then expired, then missing.
 */
// Certifications that are retired (no longer attainable). Show them but mark as retired.
const RETIRED_CODES = new Set(["ANS-C01", "MLS-C01"])

function latestBadgeFor(earned: EarnedBadge[], normalizedName: string): EarnedBadge | undefined {
  return earned
    .filter((badge) => badge.normalized === normalizedName)
    .reduce<EarnedBadge | undefined>((latest, badge) => {
      if (!latest) return badge

      const issuedDate = badge.issuedDate ?? ""
      const latestIssuedDate = latest.issuedDate ?? ""
      if (issuedDate !== latestIssuedDate) {
        return issuedDate > latestIssuedDate ? badge : latest
      }

      const expiresDate = badge.expiresDate ?? ""
      return expiresDate > (latest.expiresDate ?? "") ? badge : latest
    }, undefined)
}

export function buildMedaglier(earned: EarnedBadge[], now: Date = new Date()): MedalItem[] {
  const items: MedalItem[] = CERTIFICATIONS.map((cert, index) => {
    const match = latestBadgeFor(earned, normalizeName(cert.name))
    const issuedDate = match?.issuedDate ?? null
    const expiresDate = match?.expiresDate ?? computeExpiry(issuedDate)

    let status: MedalStatus = "missing"
    if (RETIRED_CODES.has(cert.code)) {
      // Retired certifications stay retired even when the user earned them.
      status = "retired"
    } else if (match) {
      const expires = expiresDate ? parseDateOnly(expiresDate) : null
      status = expires && formatDateOnly(expires) < formatDateOnly(now) ? "expired" : "active"
    }

    return {
      code: cert.code,
      name: cert.name,
      tier: cert.tier,
      track: cert.track,
      // Prefer the live Credly image when matched, fall back to the static official URL.
      image: match?.imageUrl ?? cert.image,
      status,
      earned: Boolean(match),
      badgeUrl: match?.badgeUrl ?? null,
      issuedDate,
      expiresDate,
      _index: index,
    } as MedalItem & { _index: number }
  })

  const statusRank: Record<MedalStatus, number> = { active: 0, expired: 1, missing: 2, retired: 3 }

  return items.sort((a, b) => {
    // 1. Active -> expired -> missing.
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status]
    }

    if (a.earned && b.earned) {
      // 2. Earned groups: most recent first.
      const da = a.issuedDate ?? ""
      const db = b.issuedDate ?? ""
      if (da !== db) return db.localeCompare(da)
    } else {
      // 3. Missing: by tier, then original list order.
      const ta = TIER_ORDER[a.tier]
      const tb = TIER_ORDER[b.tier]
      if (ta !== tb) return ta - tb
    }

    return (a as MedalItem & { _index: number })._index - (b as MedalItem & { _index: number })._index
  })
}
