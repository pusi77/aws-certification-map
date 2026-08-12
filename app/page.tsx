import { getEarnedBadges, CREDLY_USERNAME } from "@/lib/credly"
import { Confetti } from "@/components/confetti"
import { CredlyDemo } from "@/components/credly-demo"
import { buildMedaglier, summarizeMedals } from "@/lib/medaglier"
import { MedalMatrix } from "@/components/medal-matrix"
import { ExpiryCalendar } from "@/components/expiry-calendar"

export const dynamic = "force-static"

export default async function Page() {
  const earned = await getEarnedBadges(CREDLY_USERNAME || undefined)
  const items = buildMedaglier(earned)

  const { total, active, expired, missing } = summarizeMedals(items)

  const hasUsername = Boolean(CREDLY_USERNAME)
  const isComplete = total > 0 && active === total

  return (
    <main className="min-h-dvh">
      {hasUsername && isComplete && <Confetti />}
      {/* AWS Squid Ink header band */}
      <div className="bg-navy text-background">
        <div className="relative mx-auto max-w-6xl px-5 py-14 text-center sm:py-20">
          <div className="absolute right-5 top-5 flex items-center gap-3 rounded-full border border-background/20 bg-background/10 px-3 py-2 text-xs font-semibold tracking-wider text-background transition hover:bg-background/20">
            <a
              href="https://github.com/pusi77/aws-certification-map"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-background"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.286-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.388-1.333-1.758-1.333-1.758-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.762-1.605-2.665-.303-5.466-1.333-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.044.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.803 5.625-5.475 5.92.432.372.816 1.102.816 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 21.795 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Want your own page? Check the repo
            </a>
          </div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            AWS Certifications
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            AWS Certification Portfolio
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-background/70 sm:text-base">
            All your active AWS certifications, automatically matched from Credly.
          </p>

          {hasUsername && (
            <div className="mx-auto mt-10 inline-flex flex-col items-center gap-3 rounded-2xl border border-background/15 bg-background/5 px-8 py-6 backdrop-blur-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tabular-nums text-primary">{active}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-background">
                Active certifications out of {total} total
              </p>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-background/15">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${total ? (active / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-background/70">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
                  {active} active
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
                  {expired} expired
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-background/40" aria-hidden="true" />
                  {missing} not earned
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasUsername && (
        <div className="mx-auto max-w-6xl px-5 py-8">
          <CredlyDemo />
        </div>
      )}

      {hasUsername && (
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <MedalMatrix items={items} />

          <ExpiryCalendar items={items} />

          <footer className="mt-14 text-center text-xs text-muted-foreground">
            Badge data is fetched automatically from Credly. Badge images © Amazon Web Services.
          </footer>
        </div>
      )}
    </main>
  )
}
