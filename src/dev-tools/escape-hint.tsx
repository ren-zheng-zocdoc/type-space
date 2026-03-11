"use client"

import * as React from "react"

/**
 * Global Escape key handler that deactivates all dev tool modes.
 * Also renders a whisper-text hint when any tool mode is active.
 */
export function EscapeHint() {
  const [anyActive, setAnyActive] = React.useState(false)

  // Watch for any tool becoming active via aria-pressed
  React.useEffect(() => {
    const check = () => {
      const active = document.querySelectorAll(
        '[data-spacing-ui][aria-pressed="true"], ' +
        '[data-typography-ui][aria-pressed="true"], ' +
        '[data-inspector-ui][aria-pressed="true"], ' +
        '[data-vibezz-ui][aria-pressed="true"], ' +
        '[data-settings-ui][aria-pressed="true"]'
      )
      setAnyActive(active.length > 0)
    }

    const observer = new MutationObserver(check)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-pressed"],
      subtree: true,
    })
    check()
    return () => observer.disconnect()
  }, [])

  // Global Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.dispatchEvent(new CustomEvent("vibezz:deactivate-tools"))
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!anyActive) return null

  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: "monospace",
        color: "var(--text-whisper)",
        whiteSpace: "nowrap",
      }}
    >
      esc to exit mode
    </span>
  )
}
