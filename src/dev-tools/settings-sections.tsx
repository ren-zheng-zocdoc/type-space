"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Button,
} from "@/components/vibezz"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FONT_FAMILIES = [
  // Project default
  { value: "sharp-sans", label: "Sharp Sans", css: "var(--font-sharp-sans), system-ui, sans-serif" },
  // Common SaaS sans-serif families
  { value: "inter", label: "Inter", css: "'Inter', system-ui, sans-serif" },
  { value: "roboto", label: "Roboto", css: "'Roboto', system-ui, sans-serif" },
  { value: "open-sans", label: "Open Sans", css: "'Open Sans', system-ui, sans-serif" },
  { value: "lato", label: "Lato", css: "'Lato', system-ui, sans-serif" },
  { value: "nunito-sans", label: "Nunito Sans", css: "'Nunito Sans', system-ui, sans-serif" },
  { value: "source-sans", label: "Source Sans 3", css: "'Source Sans 3', system-ui, sans-serif" },
  { value: "dm-sans", label: "DM Sans", css: "'DM Sans', system-ui, sans-serif" },
  { value: "plus-jakarta", label: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { value: "manrope", label: "Manrope", css: "'Manrope', system-ui, sans-serif" },
  { value: "outfit", label: "Outfit", css: "'Outfit', system-ui, sans-serif" },
  { value: "figtree", label: "Figtree", css: "'Figtree', system-ui, sans-serif" },
  { value: "geist", label: "Geist", css: "'Geist', system-ui, sans-serif" },
  // Platform system fonts
  { value: "sf-pro", label: "SF Pro (macOS)", css: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" },
  { value: "segoe", label: "Segoe UI (Windows)", css: "'Segoe UI', system-ui, sans-serif" },
  { value: "system-ui", label: "System UI", css: "system-ui, -apple-system, sans-serif" },
  // Monospace
  { value: "monospace", label: "Monospace", css: "ui-monospace, 'SF Mono', 'Fira Code', monospace" },
]

// Google Fonts URL for families that need loading
export const GOOGLE_FONT_MAP: Record<string, string> = {
  inter: "Inter:wght@400;500;600;700",
  roboto: "Roboto:wght@400;500;700",
  "open-sans": "Open+Sans:wght@400;500;600;700",
  lato: "Lato:wght@400;700",
  "nunito-sans": "Nunito+Sans:wght@400;500;600;700",
  "source-sans": "Source+Sans+3:wght@400;500;600;700",
  "dm-sans": "DM+Sans:wght@400;500;600;700",
  "plus-jakarta": "Plus+Jakarta+Sans:wght@400;500;600;700",
  manrope: "Manrope:wght@400;500;600;700",
  outfit: "Outfit:wght@400;500;600;700",
  figtree: "Figtree:wght@400;500;600;700",
  geist: "Geist:wght@400;500;600;700",
}

export const TYPOGRAPHY_LEVELS = [
  { key: "display", label: "Display", sizeVar: "--font-size-display", lhVar: "--line-height-display", defaultSize: 28, defaultLh: 36 },
  { key: "title-1", label: "Title 1", sizeVar: "--font-size-title-1", lhVar: "--line-height-title-1", defaultSize: 28, defaultLh: 32 },
  { key: "title-2", label: "Title 2", sizeVar: "--font-size-title-2", lhVar: "--line-height-title-2", defaultSize: 20, defaultLh: 26 },
  { key: "title-3", label: "Title 3", sizeVar: "--font-size-title-3", lhVar: "--line-height-title-3", defaultSize: 18, defaultLh: 24 },
  { key: "title-4", label: "Title 4", sizeVar: "--font-size-title-4", lhVar: "--line-height-title-4", defaultSize: 16, defaultLh: 20 },
  { key: "body", label: "Body", sizeVar: "--font-size-body", lhVar: "--line-height-body", defaultSize: 16, defaultLh: 26 },
  { key: "subbody", label: "Subbody", sizeVar: "--font-size-subbody", lhVar: "--line-height-subbody", defaultSize: 14, defaultLh: 20 },
  { key: "caption", label: "Caption", sizeVar: "--font-size-caption", lhVar: "--line-height-caption", defaultSize: 12, defaultLh: 16 },
] as const

const DEFAULT_SPACING_BASE = 4 // 0.25rem = 4px
export const DEFAULT_MULTIPLIER = 1

export const ELEMENT_SPACING = [
  {
    key: "table-cell",
    label: "Table cells",
    selector: "table td",
    defaultPx: 16,
    defaultPy: 16,
    minP: 0,
    maxP: 40,
  },
  {
    key: "table-header",
    label: "Table headers",
    selector: "table th",
    defaultPx: 16,
    defaultPy: 12,
    minP: 0,
    maxP: 40,
  },
  {
    key: "card",
    label: "Cards",
    selector: ".rounded-lg[class*='border']",
    defaultPx: 20,
    defaultPy: 20,
    minP: 0,
    maxP: 48,
  },
  {
    key: "page-content",
    label: "Page content",
    selector: ".flex-1.p-6",
    defaultPx: 24,
    defaultPy: 24,
    minP: 0,
    maxP: 64,
  },
  {
    key: "dialog",
    label: "Dialogs / Drawers",
    selector: "[role='dialog']:not([data-settings-ui])",
    defaultPx: 24,
    defaultPy: 24,
    minP: 0,
    maxP: 48,
  },
  {
    key: "button",
    label: "Buttons",
    selector: "button:not([data-settings-ui] button):not([data-inspector-ui])",
    defaultPx: 20,
    defaultPy: 0,
    minP: 0,
    maxP: 40,
  },
  {
    key: "input",
    label: "Inputs",
    selector: "input:not([type='range']):not([type='checkbox']):not([data-settings-ui] input), textarea",
    defaultPx: 12,
    defaultPy: 14,
    minP: 0,
    maxP: 32,
  },
  {
    key: "badge",
    label: "Badges",
    selector: "[class*='tracking-\\[0\\.12px\\]'][class*='rounded-\\[4px\\]']",
    defaultPx: 6,
    defaultPy: 2,
    minP: 0,
    maxP: 16,
  },
  {
    key: "flag",
    label: "Flags / banners",
    selector: ".rounded-lg.w-full.p-4[class*='bg-']",
    defaultPx: 16,
    defaultPy: 16,
    minP: 0,
    maxP: 40,
  },
  {
    key: "section-gap",
    label: "Section spacing",
    selector: ".space-y-8:not([data-settings-ui])",
    defaultPx: 0,
    defaultPy: 32,
    minP: 0,
    maxP: 64,
  },
  {
    key: "header",
    label: "Page header",
    selector: "header",
    defaultPx: 16,
    defaultPy: 8,
    minP: 0,
    maxP: 40,
  },
] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ElementOverride {
  px: number
  py: number
}

export interface SpacingState {
  paddingScale: number
  marginScale: number
  gapScale: number
  elements: Record<string, ElementOverride>
}

export const DEFAULT_SPACING: SpacingState = {
  paddingScale: DEFAULT_MULTIPLIER,
  marginScale: DEFAULT_MULTIPLIER,
  gapScale: DEFAULT_MULTIPLIER,
  elements: {},
}

// ---------------------------------------------------------------------------
// TickSlider
// ---------------------------------------------------------------------------

export function TickSlider({
  value,
  defaultValue,
  min,
  max,
  step = 4,
  onChange,
  unit = "px",
  onReset,
}: {
  value: number
  defaultValue: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  unit?: string
  onReset: () => void
}) {
  const [inputValue, setInputValue] = React.useState(String(step < 1 ? value.toFixed(2) : value))
  const isModified = value !== defaultValue

  React.useEffect(() => {
    setInputValue(String(step < 1 ? value.toFixed(2) : value))
  }, [value, step])

  const ticks = React.useMemo(() => {
    const result: number[] = []
    const decimals = step < 1 ? String(step).split(".")[1]?.length ?? 0 : 0
    for (let t = min; t <= max; t += step) {
      result.push(Number(t.toFixed(decimals)))
    }
    if (result[result.length - 1] !== max) {
      result.push(Number(max.toFixed(decimals)))
    }
    if (result.length > 10) {
      const every = Math.ceil(result.length / 8)
      const thinned = result.filter((_, i) => i % every === 0)
      if (thinned[thinned.length - 1] !== max) thinned.push(Number(max.toFixed(decimals)))
      return thinned
    }
    return result
  }, [min, max, step])

  const commitInput = () => {
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed))
      onChange(clamped)
      setInputValue(String(step < 1 ? clamped.toFixed(2) : clamped))
    } else {
      setInputValue(String(step < 1 ? value.toFixed(2) : value))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 cursor-pointer"
          style={{ accentColor: "var(--core-charcoal)" }}
        />
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commitInput}
          onKeyDown={(e) => { if (e.key === "Enter") commitInput() }}
          className="w-[40px] text-[11px] leading-[16px] font-medium text-[var(--text-default)] tabular-nums text-right bg-transparent border border-[var(--stroke-default)] rounded px-1 py-0.5 outline-none focus:border-[var(--stroke-charcoal)]"
        />
        <span className="text-[10px] text-[var(--text-whisper)] w-[14px]">{unit}</span>
        <button
          onClick={onReset}
          title="Reset to default"
          className="flex-shrink-0"
          style={{
            width: 16,
            height: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            border: "none",
            background: "none",
            cursor: isModified ? "pointer" : "default",
            opacity: isModified ? 1 : 0.25,
            color: "var(--text-whisper)",
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
          disabled={!isModified}
        >
          ↺
        </button>
      </div>
      <div className="flex justify-between px-0.5">
        {ticks.map((t) => (
          <span
            key={t}
            className="text-[10px] leading-[12px] text-[var(--text-whisper)] tabular-nums"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SliderRow
// ---------------------------------------------------------------------------

export function SliderRow({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  unit,
  onChange,
  onReset,
}: {
  label: string
  value: number
  defaultValue: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  onReset: () => void
}) {
  return (
    <div className="space-y-1">
      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-default)]">
        {label}
      </span>
      <TickSlider
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        unit={unit}
        onChange={onChange}
        onReset={onReset}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TypographySection
// ---------------------------------------------------------------------------

export function TypographySection({
  fontFamily,
  setFontFamily,
  fontSizes,
  setFontSize,
  onReset,
}: {
  fontFamily: string
  setFontFamily: (v: string) => void
  fontSizes: Record<string, number>
  setFontSize: (key: string, v: number) => void
  onReset: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
            Font Family
          </label>
          {fontFamily !== "sharp-sans" && (
            <button
              onClick={() => setFontFamily("sharp-sans")}
              title="Reset to Sharp Sans"
              style={{
                fontSize: 12,
                lineHeight: 1,
                color: "var(--text-whisper)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ↺
            </button>
          )}
        </div>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger size="small" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
          Font Sizes
        </label>
        {TYPOGRAPHY_LEVELS.map((level) => (
          <div key={level.key} className="space-y-1">
            <span className="text-[12px] leading-[16px] font-medium text-[var(--text-default)]">
              {level.label}
            </span>
            <TickSlider
              value={fontSizes[level.key] ?? level.defaultSize}
              defaultValue={level.defaultSize}
              min={8}
              max={48}
              onChange={(v) => setFontSize(level.key, v)}
              onReset={() => setFontSize(level.key, level.defaultSize)}
            />
          </div>
        ))}
      </div>

      <Button variant="secondary" size="small" onClick={onReset} className="w-full">
        Reset all typography
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpacingSection
// ---------------------------------------------------------------------------

export function SpacingSection({
  spacing,
  setSpacing,
  onReset,
}: {
  spacing: SpacingState
  setSpacing: (fn: (prev: SpacingState) => SpacingState) => void
  onReset: () => void
}) {
  const setElement = React.useCallback(
    (key: string, axis: "px" | "py", value: number) => {
      setSpacing((s) => {
        const el = ELEMENT_SPACING.find((e) => e.key === key)!
        const prev = s.elements[key] ?? { px: el.defaultPx, py: el.defaultPy }
        return { ...s, elements: { ...s.elements, [key]: { ...prev, [axis]: value } } }
      })
    },
    [setSpacing],
  )

  return (
    <div className="space-y-5">
      {/* Global controls */}
      <div className="space-y-3">
        <label className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
          Global
        </label>
        <SliderRow
          label="All padding"
          value={spacing.paddingScale}
          defaultValue={DEFAULT_MULTIPLIER}
          min={0}
          max={3}
          step={0.25}
          unit="x"
          onChange={(v) => setSpacing((s) => ({ ...s, paddingScale: v }))}
          onReset={() => setSpacing((s) => ({ ...s, paddingScale: DEFAULT_MULTIPLIER }))}
        />
        <SliderRow
          label="All margin"
          value={spacing.marginScale}
          defaultValue={DEFAULT_MULTIPLIER}
          min={0}
          max={3}
          step={0.25}
          unit="x"
          onChange={(v) => setSpacing((s) => ({ ...s, marginScale: v }))}
          onReset={() => setSpacing((s) => ({ ...s, marginScale: DEFAULT_MULTIPLIER }))}
        />
        <SliderRow
          label="All gap"
          value={spacing.gapScale}
          defaultValue={DEFAULT_MULTIPLIER}
          min={0}
          max={3}
          step={0.25}
          unit="x"
          onChange={(v) => setSpacing((s) => ({ ...s, gapScale: v }))}
          onReset={() => setSpacing((s) => ({ ...s, gapScale: DEFAULT_MULTIPLIER }))}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--stroke-default)]" />

      {/* Per-element controls */}
      <div className="space-y-3">
        <label className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
          Per element
        </label>
        {ELEMENT_SPACING.map((el) => {
          const override = spacing.elements[el.key]
          const px = override?.px ?? el.defaultPx
          const py = override?.py ?? el.defaultPy
          return (
            <div key={el.key} className="space-y-1">
              <span className="text-[12px] leading-[16px] font-semibold text-[var(--text-default)]">
                {el.label}
              </span>
              {el.defaultPx > 0 && (
                <SliderRow
                  label="Horizontal"
                  value={px}
                  defaultValue={el.defaultPx}
                  min={el.minP}
                  max={el.maxP}
                  onChange={(v) => setElement(el.key, "px", v)}
                  onReset={() => setElement(el.key, "px", el.defaultPx)}
                />
              )}
              {el.defaultPy > 0 && (
                <SliderRow
                  label="Vertical"
                  value={py}
                  defaultValue={el.defaultPy}
                  min={el.minP}
                  max={el.maxP}
                  onChange={(v) => setElement(el.key, "py", v)}
                  onReset={() => setElement(el.key, "py", el.defaultPy)}
                />
              )}
            </div>
          )
        })}
      </div>

      <Button variant="secondary" size="small" onClick={onReset} className="w-full">
        Reset all spacing
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// buildOverrideCSS
// ---------------------------------------------------------------------------

export function buildOverrideCSS(
  fontFamily: string,
  fontSizes: Record<string, number>,
  spacing: SpacingState,
  colorOverrides: Record<string, string> = {},
  fontWeights: Record<string, number> = {},
): string {
  const rules: string[] = []

  if (fontFamily !== "sharp-sans") {
    const entry = FONT_FAMILIES.find((f) => f.value === fontFamily)
    if (entry) {
      rules.push(`body { font-family: ${entry.css} !important; }`)
    }
  }

  const sizeOverrides = new Map<number, { size: number; lh: number }>()
  const lhOverrides = new Map<number, number>()
  const cssVarRules: string[] = []

  for (const level of TYPOGRAPHY_LEVELS) {
    const newSize = fontSizes[level.key]
    if (newSize !== undefined && newSize !== level.defaultSize) {
      const ratio = level.defaultLh / level.defaultSize
      const newLh = Math.round(newSize * ratio)
      cssVarRules.push(`  ${level.sizeVar}: ${newSize}px;`)
      cssVarRules.push(`  ${level.lhVar}: ${newLh}px;`)
      sizeOverrides.set(level.defaultSize, { size: newSize, lh: newLh })
      lhOverrides.set(level.defaultLh, newLh)
    }
  }

  for (const [defaultPx, { size }] of sizeOverrides) {
    rules.push(`.text-\\[${defaultPx}px\\] { font-size: ${size}px !important; }`)
    rules.push(`.md\\:text-\\[${defaultPx}px\\] { font-size: ${size}px !important; }`)
  }

  for (const [defaultLh, newLh] of lhOverrides) {
    rules.push(`.leading-\\[${defaultLh}px\\] { line-height: ${newLh}px !important; --tw-leading: ${newLh}px !important; }`)
    rules.push(`.md\\:leading-\\[${defaultLh}px\\] { line-height: ${newLh}px !important; --tw-leading: ${newLh}px !important; }`)
  }

  const { paddingScale, marginScale, gapScale, elements } = spacing

  const spacingClassNums = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16]
  const esc = (n: number) => (n % 1 === 0 ? `${n}` : `${n}`.replace(".", "\\."))
  const notUI = ":not([data-settings-ui])"

  if (paddingScale !== DEFAULT_MULTIPLIER) {
    for (const n of spacingClassNums) {
      const scaled = DEFAULT_SPACING_BASE * n * paddingScale
      const c = esc(n)
      rules.push(`.p-${c}${notUI} { padding: ${scaled}px !important; }`)
      rules.push(`.px-${c}${notUI} { padding-inline: ${scaled}px !important; }`)
      rules.push(`.py-${c}${notUI} { padding-block: ${scaled}px !important; }`)
      rules.push(`.pt-${c}${notUI} { padding-top: ${scaled}px !important; }`)
      rules.push(`.pb-${c}${notUI} { padding-bottom: ${scaled}px !important; }`)
      rules.push(`.pl-${c}${notUI} { padding-left: ${scaled}px !important; }`)
      rules.push(`.pr-${c}${notUI} { padding-right: ${scaled}px !important; }`)
    }
  }

  if (marginScale !== DEFAULT_MULTIPLIER) {
    for (const n of spacingClassNums) {
      const scaled = DEFAULT_SPACING_BASE * n * marginScale
      const c = esc(n)
      rules.push(`.m-${c}${notUI} { margin: ${scaled}px !important; }`)
      rules.push(`.mx-${c}${notUI} { margin-inline: ${scaled}px !important; }`)
      rules.push(`.my-${c}${notUI} { margin-block: ${scaled}px !important; }`)
      rules.push(`.mt-${c}${notUI} { margin-top: ${scaled}px !important; }`)
      rules.push(`.mb-${c}${notUI} { margin-bottom: ${scaled}px !important; }`)
      rules.push(`.ml-${c}${notUI} { margin-left: ${scaled}px !important; }`)
      rules.push(`.mr-${c}${notUI} { margin-right: ${scaled}px !important; }`)
    }
  }

  if (gapScale !== DEFAULT_MULTIPLIER) {
    for (const n of spacingClassNums) {
      const scaled = DEFAULT_SPACING_BASE * n * gapScale
      const c = esc(n)
      rules.push(`.gap-${c}${notUI} { gap: ${scaled}px !important; }`)
      rules.push(`.space-y-${c}${notUI} > :not(:first-child) { margin-top: ${scaled}px !important; }`)
      rules.push(`.space-x-${c}${notUI} > :not(:first-child) { margin-left: ${scaled}px !important; }`)
    }
  }

  for (const el of ELEMENT_SPACING) {
    const override = elements[el.key]
    if (!override) continue
    const pxChanged = override.px !== el.defaultPx
    const pyChanged = override.py !== el.defaultPy
    if (!pxChanged && !pyChanged) continue

    const sel = el.selector

    if (el.key === "section-gap") {
      if (pyChanged) {
        rules.push(`${sel} > :not(:first-child) { margin-top: ${override.py}px !important; }`)
      }
      continue
    }

    if (pxChanged && pyChanged) {
      rules.push(`${sel} { padding: ${override.py}px ${override.px}px !important; }`)
    } else if (pxChanged) {
      rules.push(`${sel} { padding-left: ${override.px}px !important; padding-right: ${override.px}px !important; }`)
    } else if (pyChanged) {
      rules.push(`${sel} { padding-top: ${override.py}px !important; padding-bottom: ${override.py}px !important; }`)
    }
  }

  if (cssVarRules.length > 0) {
    rules.push(`:root {\n${cssVarRules.join("\n")}\n}`)
  }

  // Font weight overrides per typography level
  for (const level of TYPOGRAPHY_LEVELS) {
    const newWeight = fontWeights[level.key]
    if (newWeight !== undefined) {
      const defaultWeight = level.key.startsWith("title") || level.key === "display" ? 600 : 500
      if (newWeight !== defaultWeight) {
        const size = fontSizes[level.key] ?? level.defaultSize
        const ratio = level.defaultLh / level.defaultSize
        const lh = fontSizes[level.key] !== undefined ? Math.round(size * ratio) : level.defaultLh
        rules.push(`.text-\\[${size}px\\].leading-\\[${lh}px\\] { font-weight: ${newWeight} !important; }`)
        rules.push(`.font-${newWeight === 500 ? "semibold" : "medium"}.text-\\[${size}px\\] { font-weight: ${newWeight} !important; }`)
      }
    }
  }

  const colorVarRules: string[] = []
  for (const [variable, value] of Object.entries(colorOverrides)) {
    colorVarRules.push(`  ${variable}: ${value} !important;`)
  }
  if (colorVarRules.length > 0) {
    rules.push(`:root {\n${colorVarRules.join("\n")}\n}`)
  }

  return rules.join("\n")
}

// ---------------------------------------------------------------------------
// buildSettingsDescriptions
// ---------------------------------------------------------------------------

export function buildSettingsDescriptions(
  fontFamily: string,
  fontSizes: Record<string, number>,
  spacing: SpacingState,
  fontWeights: Record<string, number> = {},
): string {
  const items: { target: string; detail: string }[] = []

  if (fontFamily !== "sharp-sans") {
    const entry = FONT_FAMILIES.find((f) => f.value === fontFamily)
    items.push({ target: "Font family", detail: entry ? entry.label : fontFamily })
  }

  for (const level of TYPOGRAPHY_LEVELS) {
    const newSize = fontSizes[level.key]
    if (newSize !== undefined && newSize !== level.defaultSize) {
      const ratio = level.defaultLh / level.defaultSize
      const newLh = Math.round(newSize * ratio)
      items.push({
        target: level.label,
        detail: `${newSize}px/${newLh}px (was ${level.defaultSize}px/${level.defaultLh}px)`,
      })
    }
  }

  for (const level of TYPOGRAPHY_LEVELS) {
    const newWeight = fontWeights[level.key]
    if (newWeight !== undefined) {
      const defaultWeight = level.key.startsWith("title") || level.key === "display" ? 600 : 500
      if (newWeight !== defaultWeight) {
        items.push({
          target: `${level.label} weight`,
          detail: `${newWeight} (was ${defaultWeight})`,
        })
      }
    }
  }

  if (spacing.paddingScale !== DEFAULT_MULTIPLIER) {
    items.push({ target: "Padding scale", detail: `${spacing.paddingScale}×` })
  }
  if (spacing.marginScale !== DEFAULT_MULTIPLIER) {
    items.push({ target: "Margin scale", detail: `${spacing.marginScale}×` })
  }
  if (spacing.gapScale !== DEFAULT_MULTIPLIER) {
    items.push({ target: "Gap scale", detail: `${spacing.gapScale}×` })
  }

  for (const el of ELEMENT_SPACING) {
    const o = spacing.elements[el.key]
    if (!o) continue
    const pxChanged = o.px !== el.defaultPx
    const pyChanged = o.py !== el.defaultPy
    if (!pxChanged && !pyChanged) continue
    const parts: string[] = []
    if (pxChanged) parts.push(`horizontal ${o.px}px (was ${el.defaultPx}px)`)
    if (pyChanged) parts.push(`vertical ${o.py}px (was ${el.defaultPy}px)`)
    items.push({ target: el.label, detail: parts.join(", ") })
  }

  return JSON.stringify(items)
}

// ---------------------------------------------------------------------------
// Hook: load Google Fonts on demand
// ---------------------------------------------------------------------------

const FONT_LINK_ID = "__vibezz-settings-font"

export function useLoadGoogleFont(fontFamily: string) {
  React.useEffect(() => {
    const googleFamily = GOOGLE_FONT_MAP[fontFamily]
    if (!googleFamily) {
      document.getElementById(FONT_LINK_ID)?.remove()
      return
    }

    const href = `https://fonts.googleapis.com/css2?family=${googleFamily}&display=swap`

    let linkEl = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
    if (linkEl) {
      if (linkEl.href === href) return
      linkEl.href = href
    } else {
      linkEl = document.createElement("link")
      linkEl.id = FONT_LINK_ID
      linkEl.rel = "stylesheet"
      linkEl.href = href
      document.head.appendChild(linkEl)
    }

    return () => {
      document.getElementById(FONT_LINK_ID)?.remove()
    }
  }, [fontFamily])
}

// ---------------------------------------------------------------------------
// Hook: inject/update a <style> element with override CSS
// ---------------------------------------------------------------------------

const STYLE_ID = "__vibezz-settings-overrides"

export function useApplyOverrides(
  fontFamily: string,
  fontSizes: Record<string, number>,
  spacing: SpacingState,
  colorOverrides: Record<string, string> = {},
  fontWeights: Record<string, number> = {},
) {
  React.useEffect(() => {
    const css = buildOverrideCSS(fontFamily, fontSizes, spacing, colorOverrides, fontWeights)

    if (!css) {
      document.getElementById(STYLE_ID)?.remove()
      return
    }

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = STYLE_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = css
    styleEl.setAttribute("data-changes", buildSettingsDescriptions(fontFamily, fontSizes, spacing, fontWeights))

    return () => {
      document.getElementById(STYLE_ID)?.remove()
    }
  }, [fontFamily, fontSizes, spacing, colorOverrides, fontWeights])
}
