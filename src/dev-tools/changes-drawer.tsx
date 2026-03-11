"use client"

import * as React from "react"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
} from "@/components/vibezz"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STYLE_SOURCES = [
  { id: "__vibezz-spacing-overrides", label: "Spacing (in-page)" },
  { id: "__vibezz-typography-overrides", label: "Typography (in-page)" },
  { id: "__vibezz-settings-overrides", label: "Settings (global)" },
] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChangeItem {
  target: string
  detail: string
}

interface ChangeSection {
  label: string
  items: ChangeItem[]
}

// ---------------------------------------------------------------------------
// Hook: observe <head> for style element changes, count change items
// ---------------------------------------------------------------------------

function readAllChanges(): ChangeSection[] {
  const sections: ChangeSection[] = []
  for (const source of STYLE_SOURCES) {
    const el = document.getElementById(source.id)
    if (!el) continue
    const raw = el.getAttribute("data-changes")
    if (!raw) continue
    try {
      const items: ChangeItem[] = JSON.parse(raw)
      if (items.length > 0) {
        sections.push({ label: source.label, items })
      }
    } catch {
      // ignore malformed JSON
    }
  }
  return sections
}

function countAllChanges(): number {
  let total = 0
  for (const source of STYLE_SOURCES) {
    const el = document.getElementById(source.id)
    if (!el) continue
    const raw = el.getAttribute("data-changes")
    if (!raw) continue
    try {
      const items: ChangeItem[] = JSON.parse(raw)
      total += items.length
    } catch {
      // ignore
    }
  }
  return total
}

function useChangeCount(): number {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const check = () => setCount(countAllChanges())
    check()

    const observer = new MutationObserver(check)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-changes"],
    })

    return () => observer.disconnect()
  }, [])

  return count
}

// ---------------------------------------------------------------------------
// ChangesDrawer
// ---------------------------------------------------------------------------

export function ChangesDrawer() {
  const changeCount = useChangeCount()
  const [sections, setSections] = React.useState<ChangeSection[]>([])

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSections(readAllChanges())
    }
  }

  if (changeCount === 0) return null

  return (
    <Drawer onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            fontWeight: 600,
            color: "var(--text-whisper)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0 4px",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            whiteSpace: "nowrap",
          }}
        >
          {changeCount} {changeCount === 1 ? "change" : "changes"}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Active Changes</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          {sections.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: "var(--text-whisper)",
              }}
            >
              No active changes.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {sections.map((section) => (
                <div key={section.label}>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "var(--text-whisper)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    {section.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: 13,
                          fontFamily: "monospace",
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--text-default)",
                            flexShrink: 0,
                          }}
                        >
                          {item.target}
                        </span>
                        <span style={{ color: "var(--text-whisper)" }}>
                          {item.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
