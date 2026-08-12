"use client"

import { useEffect, useState } from "react"

const COLORS = ["var(--primary)", "var(--cyan)", "var(--violet)", "var(--green)", "var(--gold)"]
const PIECE_COUNT = 300
const TEARDOWN_MS = 10000

interface Piece {
  left: number
  drift: number
  spin: number
  delay: number
  duration: number
  width: number
  height: number
  color: string
  round: boolean
}

function createPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, () => ({
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 40,
    spin: 360 + Math.random() * 720,
    delay: Math.random() * 2,
    duration: 4.5 + Math.random() * 3,
    width: 6 + Math.random() * 5,
    height: 9 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    round: Math.random() < 0.25,
  }))
}

/** One-shot celebration rendered after a complete certification board mounts. */
export function Confetti() {
  const [pieces, setPieces] = useState<Piece[] | null>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    setPieces(createPieces())
    const timer = window.setTimeout(() => setPieces(null), TEARDOWN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!pieces) return null

  return (
    <div className="confetti">
      <div className="confetti-message" role="status">
        Congratulations! You earned every certification.
      </div>
      <div className="confetti-pieces" aria-hidden="true">
        {pieces.map((piece, index) => (
          <span
            key={index}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              width: `${piece.width}px`,
              height: piece.round ? `${piece.width}px` : `${piece.height}px`,
              borderRadius: piece.round ? "50%" : "1px",
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              ["--drift" as string]: `${piece.drift}vw`,
              ["--spin" as string]: `${piece.spin}deg`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
