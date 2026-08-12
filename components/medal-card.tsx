import type { MedalItem } from "@/lib/medaglier"
import { parseDateOnly } from "@/lib/utils"
import { HoloBadge } from "./holo-badge"

const TIER_STYLES: Record<MedalItem["tier"], string> = {
  Foundational: "text-muted-foreground border-border",
  Associate: "text-cyan border-cyan/40",
  Professional: "text-gold border-gold/40",
  Specialty: "text-violet border-violet/40",
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const date = parseDateOnly(iso)
  if (!date) return null
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

export function MedalCard({ item }: { item: MedalItem }) {
  const issued = formatDate(item.issuedDate)
  const expires = formatDate(item.expiresDate)
  const isActive = item.status === "active"
  const isExpired = item.status === "expired"
  const isRetired = item.status === "retired"

  return (
    <li
      className={`group relative flex h-full min-h-[24rem] flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isActive ? "border-border" : "border-border/70"
      }`}
    >
      {/* Tier chip */}
      <span
        className={`absolute left-3 top-3 rounded-full border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TIER_STYLES[item.tier]}`}
      >
        {item.tier}
      </span>

      {/* Status chip */}
      {isActive && (
        <span className="absolute right-3 top-3 max-sm:left-3 max-sm:right-auto max-sm:top-9 inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden="true" />
          Active
        </span>
      )}
      {isExpired && (
        <span className="absolute right-3 top-3 max-sm:left-3 max-sm:right-auto max-sm:top-9 rounded-full border border-danger/40 bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
          Expired
        </span>
      )}
      {isRetired && (
        <span className="absolute right-3 top-3 max-sm:left-3 max-sm:right-auto max-sm:top-9 rounded-full border border-muted-foreground/30 bg-muted-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Retired
        </span>
      )}

      {/* Badge visual */}
      <div className="mb-4 mt-6 w-full max-w-[176px] max-sm:mt-10">
        {isActive && item.badgeUrl ? (
          <div className="badge-well p-3">
            <HoloBadge image={item.image} name={item.name} href={item.badgeUrl} />
          </div>
        ) : isExpired && item.badgeUrl ? (
          <a
            href={item.badgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="badge-well-muted block p-3"
            title="This certification has expired"
            aria-label={`${item.name} - expired, open badge on Credly`}
          >
            <div className="relative aspect-square w-full">
              <img
                src={item.image || "/placeholder.svg"}
                alt={`${item.name} (expired)`}
                className="h-full w-full object-contain opacity-90 saturate-[0.55]"
                draggable={false}
                loading="eager"
              />
            </div>
          </a>
        ) : isRetired && item.earned && item.badgeUrl ? (
          <div className="badge-well p-3" title="This certification is retired but was earned">
            <HoloBadge image={item.image} name={item.name} href={item.badgeUrl} />
          </div>
        ) : isRetired ? (
          <div className="badge-well-muted relative aspect-square w-full p-3" title="This certification is retired and can no longer be earned">
            <img
              src={item.image || "/placeholder.svg"}
              alt={`${item.name} (retired)`}
              className="h-full w-full object-contain opacity-50 grayscale"
              draggable={false}
              loading="eager"
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg ring-1 ring-border transition-opacity duration-200 group-hover:opacity-100"
            >
              Retired - no longer available
            </span>
          </div>
        ) : (
          <div className="badge-well-muted relative aspect-square w-full p-3" title="Not yet earned">
            <img
              src={item.image || "/placeholder.svg"}
              alt={`${item.name} (not yet earned)`}
              className="h-full w-full object-contain opacity-50 grayscale"
              draggable={false}
              loading="eager"
            />
            {/* Tooltip */}
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg ring-1 ring-border transition-opacity duration-200 group-hover:opacity-100"
            >
              Not yet earned
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-balance text-sm font-semibold leading-snug text-card-foreground">{item.name}</h3>

      {/* Status detail */}
      <div className="mt-2 space-y-0.5 text-xs">
        {isActive && (
          <>
            <p className="font-medium text-card-foreground">{issued ? `Earned ${issued}` : "Earned"}</p>
            {expires && <p className="text-muted-foreground">Valid until {expires}</p>}
          </>
        )}
        {isExpired && (
          <>
            <p className="text-muted-foreground">{issued ? `Earned ${issued}` : "Earned"}</p>
            {expires && <p className="font-medium text-danger">Expired {expires}</p>}
          </>
        )}
        {item.status === "missing" && <p className="text-muted-foreground">Not yet earned</p>}
        {isRetired && <p className="text-muted-foreground">Retired - no longer available</p>}
      </div>
    </li>
  )
}
