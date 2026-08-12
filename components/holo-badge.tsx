"use client"

import { useCallback, useRef } from "react"

interface HoloBadgeProps {
  image: string
  name: string
  href: string
}

const MAX_TILT = 12 // degrees

export function HoloBadge({ image, name, href }: HoloBadgeProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width // 0..1
    const y = (e.clientY - rect.top) / rect.height // 0..1

    // Rotation: tilt toward the pointer.
    const rx = (x - 0.5) * 2 * MAX_TILT // rotateY
    const ry = -(y - 0.5) * 2 * MAX_TILT // rotateX

    el.style.setProperty("--px", `${x * 100}%`)
    el.style.setProperty("--py", `${y * 100}%`)
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`)
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`)
    el.style.setProperty("--scale", "1.05")
    el.style.setProperty("--o", "0.9")
  }, [])

  const handleLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--rx", "0deg")
    el.style.setProperty("--ry", "0deg")
    el.style.setProperty("--scale", "1")
    el.style.setProperty("--o", "0")
    el.style.setProperty("--px", "50%")
    el.style.setProperty("--py", "50%")
  }, [])

  return (
    <a
      ref={ref}
      className="holo-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} - open badge on Credly`}
      style={{ ["--img" as string]: `url("${image || "/placeholder.svg"}")` }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerDown={handleMove}
    >
      <div className="holo-rotator">
        <img
          className="holo-badge-img"
          src={image || "/placeholder.svg"}
          alt={name}
          draggable={false}
          loading="eager"
        />
        <div className="holo-layers" aria-hidden="true">
          <div className="holo-foil" />
          <div className="holo-rainbow" />
          <div className="holo-glare" />
        </div>
      </div>
    </a>
  )
}
