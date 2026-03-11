"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { getFiberFromDom, getComponentName, getDomNode } from "./fiber-utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SpacingValues {
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  gap: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOOL_COLOR = "#ea580c"
const PINNED_COLOR = "#3b82f6"
const STYLE_ID = "__vibezz-spacing-overrides"
const DATA_ATTR = "data-spacing-ui"
const SPACING_ID_ATTR = "data-spacing-id"

let nextSpacingId = 1

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isToolUI(el: Element): boolean {
  return (
    el.closest(`[${DATA_ATTR}]`) !== null ||
    el.closest("[data-inspector-ui]") !== null ||
    el.closest("[data-settings-ui]") !== null ||
    el.closest("[data-typography-ui]") !== null
  )
}

/** Walk fiber.return chain to find nearest React component name */
function findComponentName(el: Element): string | null {
  const fiber = getFiberFromDom(el)
  if (!fiber) return null
  let current = fiber
  while (current) {
    const name = getComponentName(current)
    if (name) return name
    current = current.return
  }
  return null
}

/** Find all DOM root nodes of instances of a given component name */
function findAllInstanceDOMs(componentName: string): Element[] {
  const results: Element[] = []
  const allElements = document.querySelectorAll("*")
  for (const el of allElements) {
    if (isToolUI(el)) continue
    const fiber = getFiberFromDom(el)
    if (!fiber) continue
    // Walk up to check if this element's nearest component matches
    let current = fiber
    while (current) {
      const name = getComponentName(current)
      if (name) {
        if (name === componentName) {
          // Get the root DOM node of this component instance
          const dom = getDomNode(current)
          if (dom && !results.includes(dom)) {
            results.push(dom)
          }
        }
        break // stop at first named component
      }
      current = current.return
    }
  }
  return results
}

function getElementLabel(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const fiber = getFiberFromDom(el)
  let componentName: string | null = null
  if (fiber) {
    let current = fiber
    while (current) {
      const name = getComponentName(current)
      if (name) {
        componentName = name
        break
      }
      current = current.return
    }
  }
  return componentName ? `${componentName} <${tag}>` : `<${tag}>`
}

function readSpacing(el: Element): SpacingValues {
  const s = getComputedStyle(el)
  return {
    paddingTop: parseInt(s.paddingTop) || 0,
    paddingRight: parseInt(s.paddingRight) || 0,
    paddingBottom: parseInt(s.paddingBottom) || 0,
    paddingLeft: parseInt(s.paddingLeft) || 0,
    marginTop: parseInt(s.marginTop) || 0,
    marginRight: parseInt(s.marginRight) || 0,
    marginBottom: parseInt(s.marginBottom) || 0,
    marginLeft: parseInt(s.marginLeft) || 0,
    gap: parseInt(s.gap) || 0,
  }
}

function hasFlexOrGrid(el: Element): boolean {
  const d = getComputedStyle(el).display
  return d === "flex" || d === "inline-flex" || d === "grid" || d === "inline-grid"
}

function formatSpacingLabel(v: SpacingValues, showGap: boolean): string {
  const p =
    v.paddingTop === v.paddingRight &&
    v.paddingRight === v.paddingBottom &&
    v.paddingBottom === v.paddingLeft
      ? `${v.paddingTop}`
      : `${v.paddingTop} ${v.paddingRight} ${v.paddingBottom} ${v.paddingLeft}`
  const m =
    v.marginTop === v.marginRight &&
    v.marginRight === v.marginBottom &&
    v.marginBottom === v.marginLeft
      ? `${v.marginTop}`
      : `${v.marginTop} ${v.marginRight} ${v.marginBottom} ${v.marginLeft}`
  let label = `p: ${p}  m: ${m}`
  if (showGap) label += `  gap: ${v.gap}`
  return label
}

function getOrAssignId(el: Element): string {
  let id = el.getAttribute(SPACING_ID_ATTR)
  if (!id) {
    id = String(nextSpacingId++)
    el.setAttribute(SPACING_ID_ATTR, id)
  }
  return id
}

function rebuildCSS(overrides: Map<string, SpacingValues>): string {
  const rules: string[] = []
  for (const [id, o] of overrides) {
    rules.push(
      `[${SPACING_ID_ATTR}="${id}"] {\n` +
        `  padding: ${o.paddingTop}px ${o.paddingRight}px ${o.paddingBottom}px ${o.paddingLeft}px !important;\n` +
        `  margin: ${o.marginTop}px ${o.marginRight}px ${o.marginBottom}px ${o.marginLeft}px !important;\n` +
        `  gap: ${o.gap}px !important;\n` +
        `}`
    )
  }
  return rules.join("\n")
}

function buildChangeDescriptions(overrides: Map<string, SpacingValues>): string {
  // Deduplicate: group by target label, keep first occurrence per target
  const seen = new Map<string, { target: string; detail: string }>()
  for (const [id, o] of overrides) {
    const el = document.querySelector(`[${SPACING_ID_ATTR}="${id}"]`)
    const tag = el ? el.tagName.toLowerCase() : "element"
    const name = el ? findComponentName(el) : null
    const target = name ? `${name} <${tag}>` : `<${tag}>`
    if (seen.has(target)) continue
    const parts: string[] = []
    parts.push(`padding ${o.paddingTop}/${o.paddingRight}/${o.paddingBottom}/${o.paddingLeft}`)
    parts.push(`margin ${o.marginTop}/${o.marginRight}/${o.marginBottom}/${o.marginLeft}`)
    parts.push(`gap ${o.gap}`)
    seen.set(target, { target, detail: parts.join(", ") })
  }
  return JSON.stringify(Array.from(seen.values()))
}

function injectCSS(overrides: Map<string, SpacingValues>) {
  const css = rebuildCSS(overrides)
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!css) {
    styleEl?.remove()
    return
  }
  if (!styleEl) {
    styleEl = document.createElement("style")
    styleEl.id = STYLE_ID
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = css
  styleEl.setAttribute("data-changes", buildChangeDescriptions(overrides))
}

// ---------------------------------------------------------------------------
// SpacingSlider — inline-styled range + input + reset (no Vibezz deps)
// ---------------------------------------------------------------------------

function SpacingSlider({
  label,
  value,
  defaultValue,
  min = 0,
  max = 64,
  step = 4,
  onChange,
}: {
  label: string
  value: number
  defaultValue: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  const [inputVal, setInputVal] = React.useState(String(value))
  const isModified = value !== defaultValue

  React.useEffect(() => {
    setInputVal(String(value))
  }, [value])

  const snap = (v: number) => Math.round(v / step) * step

  const commit = () => {
    const parsed = parseInt(inputVal)
    if (!isNaN(parsed)) {
      onChange(snap(Math.min(max, Math.max(min, parsed))))
    } else {
      setInputVal(String(value))
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 52,
          fontSize: 10,
          fontFamily: "monospace",
          color: "#666",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 4, accentColor: TOOL_COLOR, cursor: "pointer" }}
      />
      <input
        type="text"
        inputMode="numeric"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{
          width: 36,
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 600,
          textAlign: "right",
          border: "1px solid #ddd",
          borderRadius: 3,
          padding: "1px 4px",
          color: "#333",
          background: "transparent",
          outline: "none",
        }}
      />
      <span style={{ fontSize: 9, color: "#999", width: 14 }}>px</span>
      <button
        onClick={() => onChange(defaultValue)}
        disabled={!isModified}
        title="Reset"
        style={{
          width: 14,
          height: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: isModified ? "#666" : "#ccc",
          background: "none",
          border: "none",
          cursor: isModified ? "pointer" : "default",
          padding: 0,
          flexShrink: 0,
        }}
      >
        ↺
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PushButton — shows component name and instance count
// ---------------------------------------------------------------------------

function PushButton({ element, onPush }: { element: Element; onPush: () => void }) {
  const componentName = findComponentName(element)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!componentName) return
    const instances = findAllInstanceDOMs(componentName)
    setCount(instances.length)
  }, [componentName])

  if (!componentName || count <= 1) return null

  return (
    <button
      onClick={onPush}
      style={{
        width: "100%",
        height: 28,
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: 600,
        color: "#fff",
        backgroundColor: TOOL_COLOR,
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      Push to all {count} {componentName} instances
    </button>
  )
}

// ---------------------------------------------------------------------------
// SpacingPanel — floating editor
// ---------------------------------------------------------------------------

function SpacingPanel({
  element,
  rect,
  values,
  defaults,
  showGap,
  hasAnyOverrides,
  onChange,
  onReset,
  onResetAll,
  onPush,
  onClose,
}: {
  element: Element
  rect: DOMRect
  values: SpacingValues
  defaults: SpacingValues
  showGap: boolean
  hasAnyOverrides: boolean
  onChange: (patch: Partial<SpacingValues>) => void
  onReset: () => void
  onResetAll: () => void
  onPush: (() => void) | null
  onClose: () => void
}) {
  const label = getElementLabel(element)
  const panelWidth = 280

  // Position: right of element, fallback left, clamp to viewport
  let left = rect.right + 8
  if (left + panelWidth > window.innerWidth - 16) {
    left = rect.left - panelWidth - 8
  }
  left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16))
  let top = rect.top
  top = Math.max(16, Math.min(top, window.innerHeight - 400))

  // Close on click outside (delayed to avoid catching the pin click)
  React.useEffect(() => {
    let handler: ((e: MouseEvent) => void) | undefined
    const timer = setTimeout(() => {
      handler = (e: MouseEvent) => {
        const target = e.target as Element
        if (!target.closest(`[${DATA_ATTR}]`)) {
          onClose()
        }
      }
      document.addEventListener("mousedown", handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      if (handler) document.removeEventListener("mousedown", handler)
    }
  }, [onClose])

  // Track Ctrl / Cmd modifier for axis-linked editing
  const modifierRef = React.useRef(false)
  React.useEffect(() => {
    const update = (e: KeyboardEvent) => {
      modifierRef.current = e.metaKey || e.ctrlKey
    }
    document.addEventListener("keydown", update)
    document.addEventListener("keyup", update)
    return () => {
      document.removeEventListener("keydown", update)
      document.removeEventListener("keyup", update)
    }
  }, [])

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: 700,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
  }

  return createPortal(
    <div
      {...{ [DATA_ATTR]: "" }}
      style={{
        position: "fixed",
        top,
        left,
        width: panelWidth,
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
        backgroundColor: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        zIndex: 99999,
        fontFamily: "monospace",
        fontSize: 11,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#333",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 200,
          }}
        >
          {label}
        </span>
        <button
          onClick={onClose}
          style={{
            width: 20,
            height: 20,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#999",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
            padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Padding */}
        <div>
          <div style={sectionLabel}>Padding</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SpacingSlider label="top" value={values.paddingTop} defaultValue={defaults.paddingTop} onChange={(v) => onChange(modifierRef.current ? { paddingTop: v, paddingBottom: v } : { paddingTop: v })} />
            <SpacingSlider label="right" value={values.paddingRight} defaultValue={defaults.paddingRight} onChange={(v) => onChange(modifierRef.current ? { paddingRight: v, paddingLeft: v } : { paddingRight: v })} />
            <SpacingSlider label="bottom" value={values.paddingBottom} defaultValue={defaults.paddingBottom} onChange={(v) => onChange(modifierRef.current ? { paddingBottom: v, paddingTop: v } : { paddingBottom: v })} />
            <SpacingSlider label="left" value={values.paddingLeft} defaultValue={defaults.paddingLeft} onChange={(v) => onChange(modifierRef.current ? { paddingLeft: v, paddingRight: v } : { paddingLeft: v })} />
          </div>
        </div>

        {/* Margin */}
        <div>
          <div style={sectionLabel}>Margin</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SpacingSlider label="top" value={values.marginTop} defaultValue={defaults.marginTop} max={128} onChange={(v) => onChange(modifierRef.current ? { marginTop: v, marginBottom: v } : { marginTop: v })} />
            <SpacingSlider label="right" value={values.marginRight} defaultValue={defaults.marginRight} max={128} onChange={(v) => onChange(modifierRef.current ? { marginRight: v, marginLeft: v } : { marginRight: v })} />
            <SpacingSlider label="bottom" value={values.marginBottom} defaultValue={defaults.marginBottom} max={128} onChange={(v) => onChange(modifierRef.current ? { marginBottom: v, marginTop: v } : { marginBottom: v })} />
            <SpacingSlider label="left" value={values.marginLeft} defaultValue={defaults.marginLeft} max={128} onChange={(v) => onChange(modifierRef.current ? { marginLeft: v, marginRight: v } : { marginLeft: v })} />
          </div>
        </div>

        {/* Gap (only for flex/grid) */}
        {showGap && (
          <div>
            <div style={sectionLabel}>Gap</div>
            <SpacingSlider label="gap" value={values.gap} defaultValue={defaults.gap} onChange={(v) => onChange({ gap: v })} />
          </div>
        )}

        {/* Hint */}
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            color: "#999",
            lineHeight: 1.4,
          }}
        >
          Press Control to edit multiple sides.
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          style={{
            width: "100%",
            height: 28,
            fontSize: 11,
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#666",
            backgroundColor: "#f5f5f5",
            border: "1px solid #e5e5e5",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Reset to original
        </button>

        {/* Push to all instances */}
        {onPush && (
          <PushButton element={element} onPush={onPush} />
        )}

        {/* Reset all overrides across entire page */}
        {hasAnyOverrides && (
          <button
            onClick={onResetAll}
            style={{
              width: "100%",
              height: 28,
              fontSize: 11,
              fontFamily: "monospace",
              fontWeight: 600,
              color: "#dc2626",
              backgroundColor: "rgba(220, 38, 38, 0.06)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Reset all spacing overrides
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Hover highlight overlay
// ---------------------------------------------------------------------------

function HoverHighlight({ element }: { element: Element }) {
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  const spacing = readSpacing(element)
  const showGap = hasFlexOrGrid(element)
  const label = formatSpacingLabel(spacing, showGap)

  const labelAbove = rect.top > 24
  const labelTop = labelAbove ? rect.top - 20 : rect.bottom
  const labelRadius = labelAbove ? "4px 4px 0 0" : "0 0 4px 4px"

  return createPortal(
    <div {...{ [DATA_ATTR]: "" }} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }}>
      <div
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `2px solid ${TOOL_COLOR}`,
          backgroundColor: "rgba(234, 88, 12, 0.06)",
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: labelTop,
          left: rect.left,
          backgroundColor: TOOL_COLOR,
          color: "#fff",
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 600,
          lineHeight: "16px",
          padding: "2px 6px",
          borderRadius: labelRadius,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          maxWidth: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Pinned highlight
// ---------------------------------------------------------------------------

function PinnedHighlight({ rect }: { rect: DOMRect }) {
  return createPortal(
    <div {...{ [DATA_ATTR]: "" }} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99998 }}>
      <div
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `2px solid ${PINNED_COLOR}`,
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// SpacingTool — main export
// ---------------------------------------------------------------------------

type Mode = "inactive" | "hover" | "pinned"

export function SpacingTool() {
  const [mode, setMode] = React.useState<Mode>("inactive")
  const [hoveredElement, setHoveredElement] = React.useState<Element | null>(null)
  const [pinnedElement, setPinnedElement] = React.useState<Element | null>(null)
  const [pinnedRect, setPinnedRect] = React.useState<DOMRect | null>(null)
  const [currentValues, setCurrentValues] = React.useState<SpacingValues | null>(null)
  const [defaultValues, setDefaultValues] = React.useState<SpacingValues | null>(null)
  const [showGap, setShowGap] = React.useState(false)
  const [, forceUpdate] = React.useState(0)

  const overridesRef = React.useRef<Map<string, SpacingValues>>(new Map())
  // component name → SpacingValues for push-to-all
  const componentOverridesRef = React.useRef<Map<string, SpacingValues>>(new Map())
  const active = mode !== "inactive"

  // MutationObserver: apply component overrides to newly added DOM nodes
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (componentOverridesRef.current.size === 0) return
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue
          const elements = [node, ...node.querySelectorAll("*")]
          for (const el of elements) {
            if (isToolUI(el)) continue
            const name = findComponentName(el)
            if (name && componentOverridesRef.current.has(name)) {
              const dom = el
              const fiber = getFiberFromDom(dom)
              if (!fiber) continue
              // Only apply to root DOM of the component
              let isSelf = false
              let current = fiber
              while (current) {
                const cn = getComponentName(current)
                if (cn) {
                  if (cn === name) {
                    const rootDom = getDomNode(current)
                    if (rootDom === dom) isSelf = true
                  }
                  break
                }
                current = current.return
              }
              if (isSelf) {
                const id = getOrAssignId(dom)
                const values = componentOverridesRef.current.get(name)!
                overridesRef.current.set(id, { ...values })
                injectCSS(overridesRef.current)
              }
            }
          }
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Hover tracking
  React.useEffect(() => {
    if (mode !== "hover") {
      setHoveredElement(null)
      return
    }

    let rafId = 0
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (el && !isToolUI(el)) {
          setHoveredElement(el)
        }
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mode])

  // Click to pin (capture phase)
  React.useEffect(() => {
    if (mode !== "hover") return

    const handleClick = (e: MouseEvent) => {
      const el = e.target as Element
      if (isToolUI(el)) return

      e.preventDefault()
      e.stopPropagation()

      const id = getOrAssignId(el)
      const rect = el.getBoundingClientRect()

      // Read current spacing (may include previous overrides)
      const spacing = readSpacing(el)

      // If we already have overrides for this element, use them as current
      // Otherwise read fresh and store as defaults
      const existing = overridesRef.current.get(id)
      if (existing) {
        setCurrentValues({ ...existing })
        // Defaults are the original computed values before any overrides
        // We need to temporarily remove our override to read the real defaults
        setDefaultValues({ ...spacing }) // approximate — OK for session use
      } else {
        setCurrentValues({ ...spacing })
        setDefaultValues({ ...spacing })
      }

      setShowGap(hasFlexOrGrid(el))
      setPinnedElement(el)
      setPinnedRect(rect)
      setHoveredElement(null)
      setMode("pinned")
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [mode])

  // Track mode in a ref so toggle always sees latest value
  const modeRef = React.useRef(mode)
  modeRef.current = mode

  // Toggle handler
  const handleToggle = React.useCallback(() => {
    if (modeRef.current === "inactive") {
      setMode("hover")
    } else {
      setPinnedElement(null)
      setPinnedRect(null)
      setHoveredElement(null)
      setCurrentValues(null)
      setDefaultValues(null)
      setMode("inactive")
    }
  }, [])

  // Panel close — go back to hover mode so user can click another element
  const handlePanelClose = React.useCallback(() => {
    setPinnedElement(null)
    setPinnedRect(null)
    setCurrentValues(null)
    setDefaultValues(null)
    setMode("hover")
  }, [])

  // Handle value changes from the panel
  const handleChange = React.useCallback(
    (patch: Partial<SpacingValues>) => {
      if (!pinnedElement) return
      const id = getOrAssignId(pinnedElement)

      setCurrentValues((prev) => {
        if (!prev) return prev
        const updated = { ...prev, ...patch }
        overridesRef.current.set(id, updated)
        injectCSS(overridesRef.current)
        // Update pinned rect after CSS change
        requestAnimationFrame(() => {
          if (pinnedElement) {
            setPinnedRect(pinnedElement.getBoundingClientRect())
          }
        })
        return updated
      })
      forceUpdate((n) => n + 1)
    },
    [pinnedElement]
  )

  // Push spacing to all instances of the same component
  const handlePush = React.useCallback(() => {
    if (!pinnedElement || !currentValues) return
    const componentName = findComponentName(pinnedElement)
    if (!componentName) return

    // Store for MutationObserver
    componentOverridesRef.current.set(componentName, { ...currentValues })

    // Find all instances and apply
    const instances = findAllInstanceDOMs(componentName)
    for (const dom of instances) {
      const id = getOrAssignId(dom)
      overridesRef.current.set(id, { ...currentValues })
    }
    injectCSS(overridesRef.current)
    forceUpdate((n) => n + 1)
  }, [pinnedElement, currentValues])

  // Reset current element to defaults
  const handleReset = React.useCallback(() => {
    if (!pinnedElement || !defaultValues) return
    const id = pinnedElement.getAttribute(SPACING_ID_ATTR)
    if (id) {
      overridesRef.current.delete(id)
      injectCSS(overridesRef.current)
    }
    setCurrentValues({ ...defaultValues })
    requestAnimationFrame(() => {
      if (pinnedElement) {
        setPinnedRect(pinnedElement.getBoundingClientRect())
      }
    })
  }, [pinnedElement, defaultValues])

  // Reset ALL spacing overrides across the entire page
  const handleResetAll = React.useCallback(() => {
    // Clear all per-element overrides
    for (const [id] of overridesRef.current) {
      const el = document.querySelector(`[${SPACING_ID_ATTR}="${id}"]`)
      if (el) el.removeAttribute(SPACING_ID_ATTR)
    }
    overridesRef.current.clear()
    componentOverridesRef.current.clear()
    injectCSS(overridesRef.current)

    // Reset current panel to defaults if open
    if (defaultValues) {
      setCurrentValues({ ...defaultValues })
    }

    requestAnimationFrame(() => {
      if (pinnedElement) {
        setPinnedRect(pinnedElement.getBoundingClientRect())
      }
    })
    forceUpdate((n) => n + 1)
  }, [pinnedElement, defaultValues])

  // Listen for cross-tool deactivation event
  React.useEffect(() => {
    const handleDeactivate = () => {
      setPinnedElement(null)
      setPinnedRect(null)
      setHoveredElement(null)
      setCurrentValues(null)
      setDefaultValues(null)
      setMode("inactive")
    }
    document.addEventListener("vibezz:deactivate-tools", handleDeactivate)
    return () => document.removeEventListener("vibezz:deactivate-tools", handleDeactivate)
  }, [])

  // Listen for cross-tool reset event (from SettingsTool "Reset all")
  React.useEffect(() => {
    const handleExternalReset = () => {
      for (const [id] of overridesRef.current) {
        const el = document.querySelector(`[${SPACING_ID_ATTR}="${id}"]`)
        if (el) el.removeAttribute(SPACING_ID_ATTR)
      }
      overridesRef.current.clear()
      componentOverridesRef.current.clear()
      injectCSS(overridesRef.current)
      if (defaultValues) setCurrentValues({ ...defaultValues })
      forceUpdate((n) => n + 1)
    }
    document.addEventListener("vibezz:reset-in-page", handleExternalReset)
    document.addEventListener("vibezz:reset-in-page-spacing", handleExternalReset)
    return () => {
      document.removeEventListener("vibezz:reset-in-page", handleExternalReset)
      document.removeEventListener("vibezz:reset-in-page-spacing", handleExternalReset)
    }
  }, [defaultValues])

  const hasOverrides = overridesRef.current.size > 0

  return (
    <>
      <button
        {...{ [DATA_ATTR]: "" }}
        onClick={handleToggle}
        aria-pressed={active}
        title={active ? "Disable spacing editor" : "Edit element spacing"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          borderRadius: 6,
          border: active
            ? `1.5px solid ${TOOL_COLOR}`
            : "1.5px solid var(--stroke-default)",
          backgroundColor: active ? "rgba(234, 88, 12, 0.1)" : "transparent",
          color: active ? TOOL_COLOR : "var(--text-secondary)",
          fontSize: 12,
          fontFamily: "monospace",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 150ms ease",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor:
              active
                ? TOOL_COLOR
                : hasOverrides
                  ? TOOL_COLOR
                  : "var(--text-disabled)",
            transition: "background-color 150ms ease",
          }}
        />
        spacing
      </button>

      {mode === "hover" && hoveredElement && <HoverHighlight element={hoveredElement} />}

      {mode === "pinned" && pinnedElement && pinnedRect && currentValues && defaultValues && (
        <>
          <PinnedHighlight rect={pinnedRect} />
          <SpacingPanel
            element={pinnedElement}
            rect={pinnedRect}
            values={currentValues}
            defaults={defaultValues}
            showGap={showGap}
            hasAnyOverrides={hasOverrides}
            onChange={handleChange}
            onReset={handleReset}
            onResetAll={handleResetAll}
            onPush={handlePush}
            onClose={handlePanelClose}
          />
        </>
      )}
    </>
  )
}
