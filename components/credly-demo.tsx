"use client"

import { useMemo, useState } from "react"
import { buildMedaglier, summarizeMedals } from "@/lib/medaglier"
import type { EarnedBadge } from "@/lib/credly"
import { fetchCredlyBadgesClient } from "@/lib/credly"
import { Confetti } from "./confetti"
import { MedalMatrix } from "./medal-matrix"
import { ExpiryCalendar } from "./expiry-calendar"

export function CredlyDemo() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [badges, setBadges] = useState<EarnedBadge[] | null>(null)
  const [celebrationId, setCelebrationId] = useState(0)

  const items = useMemo(() => {
    return badges ? buildMedaglier(badges) : null
  }, [badges])

  const summary = useMemo(() => {
    return items ? summarizeMedals(items) : null
  }, [items])

  async function handleFetch() {
    const trimmed = username.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setBadges(null)

    try {
      const fetched = await fetchCredlyBadgesClient(trimmed)
      if (!fetched.length) {
        setError("No public badges found for that username.")
        setBadges(null)
      } else {
        setBadges(fetched)
        setCelebrationId((id) => id + 1)
      }
    } catch (err) {
      setError((err as Error)?.message || "Unable to fetch from Credly.")
      setBadges(null)
    } finally {
      setLoading(false)
    }
  }

  const isComplete = Boolean(summary && summary.total > 0 && summary.active === summary.total)

  return (
    <>
      {isComplete && <Confetti key={celebrationId} />}
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-background/15 bg-background/5 px-6 py-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Let's check your certifications</h2>
        <form
          className="flex items-center justify-center gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void handleFetch()
          }}
        >
          <label htmlFor="credly-username" className="sr-only">
            Credly username
          </label>
          <input
            id="credly-username"
            aria-label="Credly username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Put your Credly username here"
            className="w-72 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm text-background"
            disabled={loading}
          >
            {loading ? "Checking…" : "Fetch"}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm text-danger" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Tip: your Credly username is the part shown in your public profile URL.</p>
      </div>

      {summary && (
        <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col items-center gap-3 rounded-2xl border border-background/15 px-8 py-6 text-center">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tabular-nums text-primary">{summary.active}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Active certifications out of {summary.total} total
          </p>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-background/15">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${summary.total ? (summary.active / summary.total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
              {summary.active} active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
              {summary.expired} expired
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-background/40" aria-hidden="true" />
              {summary.missing} not earned
            </span>
          </div>
        </div>
      )}

      {items && (
        <div className="mx-auto mt-8 max-w-6xl space-y-6 px-5">
          <MedalMatrix items={items} />
          <ExpiryCalendar items={items} />
        </div>
      )}
    </>
  )
}
