import Image from "next/image"
import type { MedalItem } from "@/lib/medaglier"
import { parseDateOnly } from "@/lib/utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface ExpiryEntry {
  item: MedalItem
  expires: Date
}

/** Short display name, dropping the "AWS Certified" prefix for compactness. */
function shortName(name: string): string {
  return name.replace(/^AWS Certified\s*/i, "")
}

export function ExpiryCalendar({ items }: { items: MedalItem[] }) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  // Window: this month through the next 3 years (36 months out).
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3]

  // Bucket every earned certification by "YYYY-M" of its expiry date.
  const buckets = new Map<string, ExpiryEntry[]>()
  for (const item of items) {
    if (!item.expiresDate) continue
    const expires = parseDateOnly(item.expiresDate)
    if (!expires) continue
    const key = `${expires.getFullYear()}-${expires.getMonth()}`
    buckets.set(key, [...(buckets.get(key) ?? []), { item, expires }])
  }

  const isWithinWindow = (year: number, month: number) => {
    const cell = year * 12 + month
    const start = currentYear * 12 + currentMonth
    return cell >= start && cell <= start + 35
  }

  return (
    <section aria-labelledby="expiry-heading" className="mt-16">
      <div className="mb-6 flex flex-col gap-1">
        <h2 id="expiry-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Certification Expiration Calendar
        </h2>
        <p className="text-sm text-muted-foreground">
           Track upcoming expiration dates over the next three years and plan your renewals in advance.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {years.map((year) => (
          <div key={year}>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-accent">{year}</span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {MONTHS.map((label, month) => {
                const entries = buckets.get(`${year}-${month}`) ?? []
                const inWindow = isWithinWindow(year, month)
                const isCurrent = year === currentYear && month === currentMonth
                const hasExpiry = entries.length > 0

                return (
                  <div
                    key={month}
                    className={`flex min-h-24 flex-col rounded-lg border p-2 transition-colors ${
                      hasExpiry
                        ? "border-danger/40 bg-danger/5"
                        : inWindow
                          ? "border-border bg-card"
                          : "border-dashed border-border/60 bg-transparent"
                    } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          inWindow ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {label}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                          Now
                        </span>
                      )}
                    </div>

                    <ul className="flex flex-col gap-1.5">
                      {entries.map(({ item }) => (
                        <li key={item.code}>
                          <a
                            href={item.badgeUrl ?? undefined}
                            target={item.badgeUrl ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-md border border-danger/30 bg-card px-1.5 py-1 text-[11px] leading-tight text-foreground transition-colors hover:border-danger/60"
                            title={`${item.name} expires ${item.expiresDate}`}
                          >
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 object-contain"
                              unoptimized
                              loading="eager"
                              priority
                            />
                            <span className="line-clamp-2 font-medium">{shortName(item.name)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-danger/40 bg-danger/10" aria-hidden="true" />
          Certification expires this month
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm ring-2 ring-primary" aria-hidden="true" />
          Current month
        </span>
      </p>
    </section>
  )
}
