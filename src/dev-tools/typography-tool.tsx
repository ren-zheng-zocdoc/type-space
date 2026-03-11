"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { getFiberFromDom, getComponentName } from "./fiber-utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TypeStyleValues {
  fontSize: number
  lineHeight: number
  fontWeight: number
  color: string
}

interface TypeStyleKey {
  name: string
  fontSize: number
  lineHeight: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOOL_COLOR = "#f59e0b"
const PINNED_COLOR = "#3b82f6"
const STYLE_ID = "__vibezz-typography-overrides"
const DATA_ATTR = "data-typography-ui"
const TYPOGRAPHY_ID_ATTR = "data-typography-id"

let nextTypographyId = 1

const TYPOGRAPHY_LEVELS = [
  { label: "Display", defaultSize: 28, defaultLh: 36 },
  { label: "Title 1", defaultSize: 28, defaultLh: 32 },
  { label: "Title 2", defaultSize: 20, defaultLh: 26 },
  { label: "Title 3", defaultSize: 18, defaultLh: 24 },
  { label: "Title 4", defaultSize: 16, defaultLh: 20 },
  { label: "Body", defaultSize: 16, defaultLh: 26 },
  { label: "Subbody", defaultSize: 14, defaultLh: 20 },
  { label: "Caption", defaultSize: 12, defaultLh: 16 },
] as const

const WEIGHT_OPTIONS = [400, 500, 600, 700] as const
const WEIGHT_LABELS: Record<number, string> = {
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
}

// Map weight values to Tailwind class names
const WEIGHT_CLASSES: Record<number, string> = {
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
}

const TEXT_COLORS = [
  { label: "Original", value: "" },
  { label: "Default", value: "var(--text-default)" },
  { label: "Whisper", value: "var(--text-whisper)" },
  { label: "Success", value: "var(--text-success)" },
  { label: "Error", value: "var(--text-error)" },
  { label: "White", value: "var(--text-white)" },
  { label: "Disabled", value: "var(--text-disabled)" },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isToolUI(el: Element): boolean {
  return (
    el.closest(`[${DATA_ATTR}]`) !== null ||
    el.closest("[data-inspector-ui]") !== null ||
    el.closest("[data-settings-ui]") !== null ||
    el.closest("[data-spacing-ui]") !== null
  )
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

/** Check if element contains direct text content */
function hasDirectText(el: Element): boolean {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return true
    }
  }
  return false
}

/** Identify the type style of an element */
function identifyTypeStyle(el: Element): TypeStyleKey {
  const computed = getComputedStyle(el)
  const fontSize = Math.round(parseFloat(computed.fontSize))
  const lineHeight = Math.round(parseFloat(computed.lineHeight))

  // Match against known typography levels
  for (const level of TYPOGRAPHY_LEVELS) {
    if (level.defaultSize === fontSize && level.defaultLh === lineHeight) {
      return {
        name: level.label,
        fontSize,
        lineHeight,
      }
    }
  }

  return {
    name: `Custom`,
    fontSize,
    lineHeight,
  }
}

/** Read current type style values from an element */
function readTypeStyle(el: Element): TypeStyleValues {
  const computed = getComputedStyle(el)
  return {
    fontSize: Math.round(parseFloat(computed.fontSize)),
    lineHeight: Math.round(parseFloat(computed.lineHeight)),
    fontWeight: Math.round(parseFloat(computed.fontWeight)),
    color: "",
  }
}

function getOrAssignId(el: Element): string {
  let id = el.getAttribute(TYPOGRAPHY_ID_ATTR)
  if (!id) {
    id = String(nextTypographyId++)
    el.setAttribute(TYPOGRAPHY_ID_ATTR, id)
  }
  return id
}

// ---------------------------------------------------------------------------
// CSS injection
// ---------------------------------------------------------------------------

/** Build CSS for per-instance overrides */
function buildPerInstanceCSS(overrides: Map<string, TypeStyleValues>): string {
  const rules: string[] = []
  for (const [id, o] of overrides) {
    const colorLine = o.color ? `  color: ${o.color} !important;\n` : ""
    rules.push(
      `[${TYPOGRAPHY_ID_ATTR}="${id}"] {\n` +
        `  font-size: ${o.fontSize}px !important;\n` +
        `  line-height: ${o.lineHeight}px !important;\n` +
        `  font-weight: ${o.fontWeight} !important;\n` +
        colorLine +
        `}`
    )
  }
  return rules.join("\n")
}

/** Build CSS for pushed type style overrides (Tailwind class selectors) */
function buildPushedCSS(typeOverrides: Map<string, TypeStyleValues>): string {
  const rules: string[] = []
  for (const [key, values] of typeOverrides) {
    const [origSize, origLh] = key.split("-").map(Number)
    // Override Tailwind utility classes
    rules.push(`.text-\\[${origSize}px\\] { font-size: ${values.fontSize}px !important; }`)
    rules.push(`.md\\:text-\\[${origSize}px\\] { font-size: ${values.fontSize}px !important; }`)
    rules.push(`.leading-\\[${origLh}px\\] { line-height: ${values.lineHeight}px !important; --tw-leading: ${values.lineHeight}px !important; }`)
    rules.push(`.md\\:leading-\\[${origLh}px\\] { line-height: ${values.lineHeight}px !important; --tw-leading: ${values.lineHeight}px !important; }`)

    // Find original weight class and override it
    const origLevel = TYPOGRAPHY_LEVELS.find(l => l.defaultSize === origSize && l.defaultLh === origLh)
    if (origLevel) {
      // Override all weight classes to the new weight for elements with this size
      for (const [w, cls] of Object.entries(WEIGHT_CLASSES)) {
        rules.push(`.text-\\[${origSize}px\\].${cls.replace("-", "\\-")} { font-weight: ${values.fontWeight} !important; }`)
      }
    }

    // Color override targeting the Tailwind size class
    if (values.color) {
      rules.push(`.text-\\[${origSize}px\\] { color: ${values.color} !important; }`)
      rules.push(`.md\\:text-\\[${origSize}px\\] { color: ${values.color} !important; }`)
    }
  }
  return rules.join("\n")
}

/** Resolve a CSS var color value to its label, e.g. "var(--text-error)" → "Error" */
function colorLabel(value: string): string {
  const match = TEXT_COLORS.find((c) => c.value === value)
  return match ? match.label : value
}

function buildChangeDescriptions(
  instanceOverrides: Map<string, TypeStyleValues>,
  typeOverrides: Map<string, TypeStyleValues>,
): string {
  const items: { target: string; detail: string }[] = []

  // Collect the type-style keys that have been pushed to all
  const pushedKeys = new Set<string>()
  for (const key of typeOverrides.keys()) {
    pushedKeys.add(key)
  }

  // Per-instance overrides — skip if the element's type style was already pushed
  for (const [id, o] of instanceOverrides) {
    const el = document.querySelector(`[${TYPOGRAPHY_ID_ATTR}="${id}"]`)
    if (el) {
      const key = identifyTypeStyle(el)
      const typeKey = `${key.fontSize}-${key.lineHeight}`
      if (pushedKeys.has(typeKey)) continue
    }
    const tag = el ? el.tagName.toLowerCase() : "element"
    const name = el ? getElementLabel(el) : `<${tag}>`
    const parts: string[] = [
      `font-size ${o.fontSize}px`,
      `line-height ${o.lineHeight}px`,
      `weight ${o.fontWeight}`,
    ]
    if (o.color) parts.push(`color ${colorLabel(o.color)}`)
    items.push({ target: name, detail: parts.join(", ") })
  }

  // Type-level overrides (pushed to all)
  for (const [key, o] of typeOverrides) {
    const [origSize, origLh] = key.split("-").map(Number)
    const level = TYPOGRAPHY_LEVELS.find(
      (l) => l.defaultSize === origSize && l.defaultLh === origLh
    )
    const target = level ? `All ${level.label}` : `All ${origSize}/${origLh}`
    const parts: string[] = [
      `font-size ${o.fontSize}px`,
      `line-height ${o.lineHeight}px`,
      `weight ${o.fontWeight}`,
    ]
    if (o.color) parts.push(`color ${colorLabel(o.color)}`)
    items.push({ target, detail: parts.join(", ") })
  }

  return JSON.stringify(items)
}

function injectCSS(
  instanceOverrides: Map<string, TypeStyleValues>,
  typeOverrides: Map<string, TypeStyleValues>,
) {
  const instanceCSS = buildPerInstanceCSS(instanceOverrides)
  const pushedCSS = buildPushedCSS(typeOverrides)
  const css = [instanceCSS, pushedCSS].filter(Boolean).join("\n")

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
  styleEl.setAttribute("data-changes", buildChangeDescriptions(instanceOverrides, typeOverrides))
}

// ---------------------------------------------------------------------------
// TypographySlider — range + input + reset
// ---------------------------------------------------------------------------

function TypographySlider({
  label,
  value,
  defaultValue,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  defaultValue: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const [inputVal, setInputVal] = React.useState(String(value))
  const isModified = value !== defaultValue

  React.useEffect(() => {
    setInputVal(String(value))
  }, [value])

  const commit = () => {
    const parsed = parseInt(inputVal)
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    } else {
      setInputVal(String(value))
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 64,
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
// WeightSelector — 4 clickable buttons for font weight
// ---------------------------------------------------------------------------

function WeightSelector({
  value,
  defaultValue,
  onChange,
}: {
  value: number
  defaultValue: number
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 64,
          fontSize: 10,
          fontFamily: "monospace",
          color: "#666",
          flexShrink: 0,
        }}
      >
        weight
      </span>
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {WEIGHT_OPTIONS.map((w) => (
          <button
            key={w}
            onClick={() => onChange(w)}
            title={WEIGHT_LABELS[w]}
            style={{
              flex: 1,
              height: 22,
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: w === value ? 700 : 400,
              color: w === value ? "#fff" : "#666",
              backgroundColor: w === value ? TOOL_COLOR : "#f5f5f5",
              border: w === value ? "none" : "1px solid #e5e5e5",
              borderRadius: 3,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {w}
          </button>
        ))}
      </div>
      <button
        onClick={() => onChange(defaultValue)}
        disabled={value === defaultValue}
        title="Reset"
        style={{
          width: 14,
          height: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: value !== defaultValue ? "#666" : "#ccc",
          background: "none",
          border: "none",
          cursor: value !== defaultValue ? "pointer" : "default",
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
// ColorSelect — dropdown for text color
// ---------------------------------------------------------------------------

function ColorSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 64,
          fontSize: 10,
          fontFamily: "monospace",
          color: "#666",
          flexShrink: 0,
        }}
      >
        color
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          height: 22,
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 600,
          color: "#333",
          backgroundColor: "#f5f5f5",
          border: "1px solid #e5e5e5",
          borderRadius: 3,
          padding: "0 4px",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {TEXT_COLORS.map((c) => (
          <option key={c.label} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onChange("")}
        disabled={!value}
        title="Reset"
        style={{
          width: 14,
          height: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: value ? "#666" : "#ccc",
          background: "none",
          border: "none",
          cursor: value ? "pointer" : "default",
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
// TypographyPanel — floating editor
// ---------------------------------------------------------------------------

function TypographyPanel({
  element,
  rect,
  values,
  defaults,
  styleKey,
  hasAnyOverrides,
  onChange,
  onReset,
  onResetAll,
  onPush,
  onClose,
}: {
  element: Element
  rect: DOMRect
  values: TypeStyleValues
  defaults: TypeStyleValues
  styleKey: TypeStyleKey
  hasAnyOverrides: boolean
  onChange: (patch: Partial<TypeStyleValues>) => void
  onReset: () => void
  onResetAll: () => void
  onPush: () => void
  onClose: () => void
}) {
  const label = getElementLabel(element)
  const panelWidth = 280

  let left = rect.right + 8
  if (left + panelWidth > window.innerWidth - 16) {
    left = rect.left - panelWidth - 8
  }
  left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16))
  let top = rect.top
  top = Math.max(16, Math.min(top, window.innerHeight - 400))

  // Close on click outside
  React.useEffect(() => {
    let cleanup: (() => void) | undefined
    const timer = setTimeout(() => {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as Element
        if (!target.closest(`[${DATA_ATTR}]`)) {
          onClose()
        }
      }
      document.addEventListener("mousedown", handleClick)
      cleanup = () => document.removeEventListener("mousedown", handleClick)
    }, 100)
    return () => {
      clearTimeout(timer)
      cleanup?.()
    }
  }, [onClose])

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: 700,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
  }

  const styleLabel = `${styleKey.name} ${styleKey.fontSize}/${styleKey.lineHeight}`

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
        <div style={{ overflow: "hidden", maxWidth: 220 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: TOOL_COLOR,
              fontWeight: 600,
              marginTop: 1,
            }}
          >
            {styleLabel}
          </div>
        </div>
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
        <div>
          <div style={sectionLabel}>Typography</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TypographySlider
              label="font-size"
              value={values.fontSize}
              defaultValue={defaults.fontSize}
              min={8}
              max={48}
              onChange={(v) => onChange({ fontSize: v })}
            />
            <TypographySlider
              label="line-height"
              value={values.lineHeight}
              defaultValue={defaults.lineHeight}
              min={8}
              max={72}
              onChange={(v) => onChange({ lineHeight: v })}
            />
            <WeightSelector
              value={values.fontWeight}
              defaultValue={defaults.fontWeight}
              onChange={(v) => onChange({ fontWeight: v })}
            />
            <ColorSelect
              value={values.color}
              onChange={(v) => onChange({ color: v })}
            />
          </div>
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

        {/* Push to all */}
        {styleKey.name !== "Custom" && (
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
            Push to all {styleKey.name}
          </button>
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
            Reset all typography overrides
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

  const style = readTypeStyle(element)
  const key = identifyTypeStyle(element)
  const label = `${key.name} ${key.fontSize}/${key.lineHeight} · ${style.fontWeight}`

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
          backgroundColor: "rgba(245, 158, 11, 0.06)",
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
// TypographyTool — main export
// ---------------------------------------------------------------------------

type Mode = "inactive" | "hover" | "pinned"

export function TypographyTool() {
  const [mode, setMode] = React.useState<Mode>("inactive")
  const [hoveredElement, setHoveredElement] = React.useState<Element | null>(null)
  const [pinnedElement, setPinnedElement] = React.useState<Element | null>(null)
  const [pinnedRect, setPinnedRect] = React.useState<DOMRect | null>(null)
  const [currentValues, setCurrentValues] = React.useState<TypeStyleValues | null>(null)
  const [defaultValues, setDefaultValues] = React.useState<TypeStyleValues | null>(null)
  const [styleKey, setStyleKey] = React.useState<TypeStyleKey | null>(null)
  const [, forceUpdate] = React.useState(0)

  const instanceOverridesRef = React.useRef<Map<string, TypeStyleValues>>(new Map())
  const typeOverridesRef = React.useRef<Map<string, TypeStyleValues>>(new Map())
  const active = mode !== "inactive"

  // Hover tracking — only highlight elements with direct text
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
        if (el && !isToolUI(el) && hasDirectText(el)) {
          setHoveredElement(el)
        } else {
          setHoveredElement(null)
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
      if (!hasDirectText(el)) return

      e.preventDefault()
      e.stopPropagation()

      const rect = el.getBoundingClientRect()
      const style = readTypeStyle(el)
      const key = identifyTypeStyle(el)

      const id = getOrAssignId(el)
      const existing = instanceOverridesRef.current.get(id)

      if (existing) {
        setCurrentValues({ ...existing })
      } else {
        setCurrentValues({ ...style })
      }
      setDefaultValues({ ...style })
      setStyleKey(key)
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
      setStyleKey(null)
      setMode("inactive")
    }
  }, [])

  // Panel close — go back to hover mode
  const handlePanelClose = React.useCallback(() => {
    setPinnedElement(null)
    setPinnedRect(null)
    setCurrentValues(null)
    setDefaultValues(null)
    setStyleKey(null)
    setMode("hover")
  }, [])

  // Handle value changes from the panel
  const handleChange = React.useCallback(
    (patch: Partial<TypeStyleValues>) => {
      if (!pinnedElement) return
      const id = getOrAssignId(pinnedElement)

      setCurrentValues((prev) => {
        if (!prev) return prev
        const updated = { ...prev, ...patch }
        instanceOverridesRef.current.set(id, updated)
        injectCSS(instanceOverridesRef.current, typeOverridesRef.current)
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

  // Reset current element
  const handleReset = React.useCallback(() => {
    if (!pinnedElement || !defaultValues) return
    const id = pinnedElement.getAttribute(TYPOGRAPHY_ID_ATTR)
    if (id) {
      instanceOverridesRef.current.delete(id)
      injectCSS(instanceOverridesRef.current, typeOverridesRef.current)
    }
    setCurrentValues({ ...defaultValues })
    requestAnimationFrame(() => {
      if (pinnedElement) {
        setPinnedRect(pinnedElement.getBoundingClientRect())
      }
    })
  }, [pinnedElement, defaultValues])

  // Push to all instances of same type style
  const handlePush = React.useCallback(() => {
    if (!currentValues || !styleKey || styleKey.name === "Custom") return

    const key = `${styleKey.fontSize}-${styleKey.lineHeight}`
    typeOverridesRef.current.set(key, { ...currentValues })
    injectCSS(instanceOverridesRef.current, typeOverridesRef.current)
    forceUpdate((n) => n + 1)
  }, [currentValues, styleKey])

  // Reset ALL typography overrides across the entire page
  const handleResetAll = React.useCallback(() => {
    // Clear all per-instance overrides
    for (const [id] of instanceOverridesRef.current) {
      const el = document.querySelector(`[${TYPOGRAPHY_ID_ATTR}="${id}"]`)
      if (el) el.removeAttribute(TYPOGRAPHY_ID_ATTR)
    }
    instanceOverridesRef.current.clear()
    typeOverridesRef.current.clear()
    injectCSS(instanceOverridesRef.current, typeOverridesRef.current)

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
      setStyleKey(null)
      setMode("inactive")
    }
    document.addEventListener("vibezz:deactivate-tools", handleDeactivate)
    return () => document.removeEventListener("vibezz:deactivate-tools", handleDeactivate)
  }, [])

  // Listen for cross-tool reset event (from SettingsTool "Reset all")
  React.useEffect(() => {
    const handleExternalReset = () => {
      for (const [id] of instanceOverridesRef.current) {
        const el = document.querySelector(`[${TYPOGRAPHY_ID_ATTR}="${id}"]`)
        if (el) el.removeAttribute(TYPOGRAPHY_ID_ATTR)
      }
      instanceOverridesRef.current.clear()
      typeOverridesRef.current.clear()
      injectCSS(instanceOverridesRef.current, typeOverridesRef.current)
      if (defaultValues) setCurrentValues({ ...defaultValues })
      forceUpdate((n) => n + 1)
    }
    document.addEventListener("vibezz:reset-in-page", handleExternalReset)
    document.addEventListener("vibezz:reset-in-page-typography", handleExternalReset)
    return () => {
      document.removeEventListener("vibezz:reset-in-page", handleExternalReset)
      document.removeEventListener("vibezz:reset-in-page-typography", handleExternalReset)
    }
  }, [defaultValues])

  const hasOverrides = instanceOverridesRef.current.size > 0 || typeOverridesRef.current.size > 0

  return (
    <>
      <button
        {...{ [DATA_ATTR]: "" }}
        onClick={handleToggle}
        aria-pressed={active}
        title={active ? "Disable typography editor" : "Edit text typography"}
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
          backgroundColor: active ? "rgba(245, 158, 11, 0.1)" : "transparent",
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
        typography
      </button>

      {mode === "hover" && hoveredElement && <HoverHighlight element={hoveredElement} />}

      {mode === "pinned" && pinnedElement && pinnedRect && currentValues && defaultValues && styleKey && (
        <>
          <PinnedHighlight rect={pinnedRect} />
          <TypographyPanel
            element={pinnedElement}
            rect={pinnedRect}
            values={currentValues}
            defaults={defaultValues}
            styleKey={styleKey}
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
