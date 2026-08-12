import { normalizeName } from "./certifications"
import { CREDLY_USERNAME as CONFIG_CREDLY_USERNAME } from "./config"

// Re-export for backward compatibility
export const CREDLY_USERNAME = CONFIG_CREDLY_USERNAME

const ALIASED_BADGE_NAMES: Record<string, { normalized: string; imageUrl: string }> = {
  [normalizeName("AWS Certified SysOps Administrator – Associate")]: {
    normalized: normalizeName("AWS Certified CloudOps Administrator – Associate"),
    imageUrl: "https://images.credly.com/images/88a6405e-0f26-442a-95ed-f9b9db4c857e/blob",
  },
  [normalizeName("AWS Certified SysOps Administrator - Associate")]: {
    normalized: normalizeName("AWS Certified CloudOps Administrator – Associate"),
    imageUrl: "https://images.credly.com/images/88a6405e-0f26-442a-95ed-f9b9db4c857e/blob",
  },
}

function createEarnedBadgeFromCredly(b: CredlyBadge): EarnedBadge | null {
  const name = b.badge_template?.name?.trim()
  if (!name) return null

  const normalizedName = normalizeName(name)
  const alias = ALIASED_BADGE_NAMES[normalizedName]

  return {
    badgeId: b.id,
    badgeUrl: `https://www.credly.com/badges/${b.id}`,
    name: alias ? "AWS Certified CloudOps Administrator – Associate" : name,
    normalized: alias ? alias.normalized : normalizedName,
    issuedDate: b.issued_at_date ?? null,
    expiresDate: b.expires_at_date ?? null,
    imageUrl: alias ? alias.imageUrl : b.badge_template?.image_url ?? null,
  }
}

function createEarnedBadgesFromCredly(data: CredlyBadge[]): EarnedBadge[] {
  return data
    .map(createEarnedBadgeFromCredly)
    .filter((badge): badge is EarnedBadge => badge !== null)
}

export interface EarnedBadge {
  /** Credly badge instance UUID */
  badgeId: string
  /** Public badge URL on Credly */
  badgeUrl: string
  /** Certification name from the badge template */
  name: string
  /** Normalized name for matching against the official list */
  normalized: string
  /** ISO date (YYYY-MM-DD) the badge was issued, if available */
  issuedDate: string | null
  /** ISO date (YYYY-MM-DD) the badge expires, from the Credly badge record */
  expiresDate: string | null
  /** Official badge image from the template */
  imageUrl: string | null
}

interface CredlyBadge {
  id: string
  issued_at_date?: string | null
  expires_at_date?: string | null
  badge_template?: {
    name?: string
    image_url?: string
  }
}

interface CredlyResponse {
  data?: CredlyBadge[]
  metadata?: { total_pages?: number }
}

const CREDLY_USER_AGENT =
  "Mozilla/5.0 (compatible; AWS-Medaglier/1.0)"

async function fetchCredlyBadges(username: string, serverFetch: boolean): Promise<EarnedBadge[]> {
  const badges: EarnedBadge[] = []
  let page = 1
  let totalPages = 1

  try {
    do {
      const headers: Record<string, string> = {
        Accept: "application/json",
      }
      if (serverFetch) {
        headers["User-Agent"] = CREDLY_USER_AGENT
      }

      const res = await fetch(
        `https://www.credly.com/users/${encodeURIComponent(username)}/badges?page=${page}`,
        {
          headers,
        },
      )

      if (!res.ok) break

      const json = (await res.json()) as CredlyResponse
      const data = json.data ?? []
      totalPages = json.metadata?.total_pages ?? 1

      badges.push(...createEarnedBadgesFromCredly(data))

      page += 1
    } while (page <= totalPages)
  } catch (err) {
    console.log("[Credly] fetch failed:", (err as Error).message)
  }

  return badges
}

export async function getEarnedBadges(username?: string): Promise<EarnedBadge[]> {
  const effectiveUsername = username ?? CREDLY_USERNAME
  if (!effectiveUsername) return []
  return fetchCredlyBadges(effectiveUsername, true)
}

export async function fetchCredlyBadgesClient(username: string): Promise<EarnedBadge[]> {
  let page = 1
  let totalPages = 1
  const badges: EarnedBadge[] = []

  do {
    const url = new URL("/api/credly", typeof window !== "undefined" ? window.location.origin : "")
    url.searchParams.set("username", username)
    url.searchParams.set("page", String(page))

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Credly proxy request failed with ${res.status}`)
    }

    const json = (await res.json()) as CredlyResponse
    badges.push(...createEarnedBadgesFromCredly(json.data ?? []))
    totalPages = json.metadata?.total_pages ?? 1
    page += 1
  } while (page <= totalPages)

  return badges
}
