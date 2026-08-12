import type { CSSProperties } from "react"
import type { MedalItem } from "@/lib/medaglier"
import { MedalCard } from "./medal-card"

/** Column order of the role-based board (mirrors the official AWS chart). */
const TRACKS = ["Architect", "Operations", "Developer", "Data & AI"] as const
type Track = (typeof TRACKS)[number]

/** Level bands, top to bottom, for the role-based board. */
const LEVELS = ["Professional", "Associate"] as const

const LEVEL_ACCENT: Record<string, string> = {
  Professional: "text-gold",
  Associate: "text-cyan",
  Foundational: "text-muted-foreground",
  Specialty: "text-violet",
}

/**
 * Professional certifications whose discipline spans two adjacent tracks.
 * They render centered on the divider between the two lanes instead of
 * sitting rigidly in a single column - e.g. DevOps sits between Operations
 * and Developer.
 */
const STRADDLE: Record<string, [Track, Track]> = {
  "DOP-C02": ["Operations", "Developer"],
}

/**
 * Certifications that split a shared lane into side-by-side slots. The lane is
 * widened to hold both at full badge size - e.g. the Data & AI lane renders
 * Data Engineer next to Machine Learning Engineer instead of stacked.
 */
const SPLIT: Record<string, { track: Track; side: "left" | "right" }> = {
  "DEA-C01": { track: "Data & AI", side: "left" },
  "MLA-C01": { track: "Data & AI", side: "right" },
}

/** Certifications centered over a widened lane while retaining their catalog track. */
const CENTERED: Record<string, Track> = {
  "AIP-C01": "Data & AI",
}

const trackIndex = (t: Track) => TRACKS.indexOf(t)

/** Board width in column units: 2 per track, plus 2 extra for the widened Data & AI lane. */
const GRID_UNITS = TRACKS.length * 2 + 2

/**
 * Column placement on a board with 2 half-columns per track (the Data & AI
 * lane is 4 half-columns wide to seat two badges side by side). A single-track
 * badge fills its track's 2 half-columns; a straddling badge takes the inner
 * half of each neighbouring track so it centers on the divider.
 */
function placement(item: MedalItem, row: number): CSSProperties {
  const span = STRADDLE[item.code]
  if (span) {
    const left = Math.min(trackIndex(span[0]), trackIndex(span[1]))
    // inner halves of the two lanes → start on the boundary
    return { gridColumn: `${1 + left * 2 + 1} / span 2`, gridRow: row }
  }
  const centeredTrack = CENTERED[item.code]
  if (centeredTrack) {
    const t = trackIndex(centeredTrack)
    // Use the inner two half-columns so the card stays the same width as the others.
    return { gridColumn: `${1 + t * 2 + 1} / span 2`, gridRow: row }
  }
  const split = SPLIT[item.code]
  if (split) {
    const t = trackIndex(split.track)
    const col = 1 + t * 2 + (split.side === "right" ? 2 : 0)
    return { gridColumn: `${col} / span 2`, gridRow: row }
  }
  const t = trackIndex(item.track as Track)
  return { gridColumn: `${1 + t * 2} / span 2`, gridRow: row }
}

function levelItems(items: MedalItem[], level: string) {
  return items.filter((i) => i.tier === level)
}

export function MedalMatrix({ items }: { items: MedalItem[] }) {
  const foundational = items.filter((i) => i.tier === "Foundational")
  // Exclude retired certs from the visible Specialty panel (they appear in Retired section)
  const specialty = items.filter((i) => i.tier === "Specialty" && i.status !== "retired")
  const retired = items.filter((i) => i.status === "retired")

  return (
    <div className="space-y-10">
      {/* ---------- Role-based board ---------- */}
      <section>
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Role-based certifications
        </h2>

        {/* Desktop / tablet: designed board with background grouping lanes */}
        <div className="relative hidden overflow-hidden rounded-2xl border border-border bg-muted/20 md:block">
          {/* Background lanes - the grouping lines behind the badges */}
          <div
            className="pointer-events-none absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_UNITS}, minmax(0, 1fr))`,
              gridAutoRows: "1fr",
            }}
            aria-hidden="true"
          >
            {TRACKS.map((track, i) => (
              <div
                key={track}
                className={`h-full ${i === 0 ? "" : "border-l border-dashed border-border/60"}`}
                style={{ gridColumn: i === TRACKS.length - 1 ? `7 / span 4` : `${1 + i * 2} / span 2` }}
              >
                <div className="h-full bg-foreground/[0.02]" />
              </div>
            ))}
          </div>

          {/* Content grid: label gutter + 2 half-columns per track */}
          <div
            className="relative grid items-stretch gap-y-8 px-4 pb-4 pt-6"
            style={{ gridTemplateColumns: `repeat(${GRID_UNITS}, minmax(0, 1fr))` }}
          >
            {LEVELS.map((level, levelIdx) => {
              const row = levelIdx + 1
              const rowItems = levelItems(items, level)
              // group same-track badges so a track with two Associates stacks them
              const byTrack = new Map<string, MedalItem[]>()
              for (const it of rowItems) {
                const key = STRADDLE[it.code]
                  ? `straddle:${it.code}`
                  : SPLIT[it.code]
                    ? `split:${it.code}`
                    : `track:${it.track}`
                byTrack.set(key, [...(byTrack.get(key) ?? []), it])
              }

              return (
                <div key={level} className="contents">
                  {/* Badges, positioned by track / straddle / split lane */}
                  {[...byTrack.values()].map((group) => (
                    <div
                      key={group[0].code}
                      className="flex flex-col gap-4 self-start"
                      style={placement(group[0], row)}
                    >
                      {group.map((item) => (
                        <MedalCard key={item.code} item={item} />
                      ))}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Track labels along the bottom of the board */}
            {TRACKS.map((track, i) => (
              <div
                key={track}
                className="pt-2 text-center text-xs font-bold uppercase tracking-widest text-foreground"
                style={{
                  gridColumn: i === TRACKS.length - 1 ? `7 / span 4` : `${1 + i * 2} / span 2`,
                  gridRow: LEVELS.length + 1,
                }}
              >
                {track}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked by level */}
        <div className="space-y-8 md:hidden">
          {LEVELS.map((level) => {
            const rowItems = levelItems(items, level)
            if (rowItems.length === 0) return null
            return (
              <div key={level} className="rounded-2xl border border-border bg-muted/20 p-4">
                <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${LEVEL_ACCENT[level]}`}>{level}</h3>
                <ul className="grid grid-cols-2 gap-4">
                  {rowItems.map((item) => (
                    <MedalCard key={item.code} item={item} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------- Foundational + Specialty (2/3 : 1/3 at xl) ---------- */}
      {(foundational.length > 0 || specialty.length > 0) && (
        <section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Foundational (2/3) */}
            {foundational.length > 0 && (
              <div className="xl:col-span-2">
                <h2 className={`mb-5 text-sm font-semibold uppercase tracking-widest ${LEVEL_ACCENT.Foundational}`}>
                  Foundational
                </h2>
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <ul
                    className="grid gap-4"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 14rem))" }}
                  >
                    {foundational.map((item) => (
                      <MedalCard key={item.code} item={item} />
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Specialty (1/3) */}
            {specialty.length > 0 && (
              <div className="xl:col-span-1">
                <h2 className={`mb-5 text-sm font-semibold uppercase tracking-widest ${LEVEL_ACCENT.Specialty}`}>
                  Specialty
                </h2>
                <div className="rounded-2xl border border-violet/25 bg-violet/[0.04] p-4">
                  <ul
                    className="grid gap-4"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 14rem))" }}
                  >
                    {specialty.map((item) => (
                      <MedalCard key={item.code} item={item} />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------- Retired cluster ---------- */}
      {retired.length > 0 && (
        <section>
          <h2 className={`mb-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground`}>
            Retired certifications
          </h2>
          <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
            <ul className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 14rem))" }}>
              {retired.map((item) => (
                <MedalCard key={item.code} item={item} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
