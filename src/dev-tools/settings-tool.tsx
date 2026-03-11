"use client"

import * as React from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "@/components/vibezz"
import {
  TYPOGRAPHY_LEVELS,
  ELEMENT_SPACING,
  DEFAULT_MULTIPLIER,
  DEFAULT_SPACING,
  type SpacingState,
  TypographySection,
  SpacingSection,
  useLoadGoogleFont,
  useApplyOverrides,
} from "./settings-sections"

// ---------------------------------------------------------------------------
// SettingsTool — main export
// ---------------------------------------------------------------------------

export function SettingsTool() {
  const [open, setOpen] = React.useState(false)
  const [fontFamily, setFontFamily] = React.useState("sharp-sans")
  const [fontSizes, setFontSizes] = React.useState<Record<string, number>>({})
  const [spacing, setSpacing] = React.useState<SpacingState>(DEFAULT_SPACING)

  const handleSetFontSize = React.useCallback((key: string, value: number) => {
    setFontSizes((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetTypography = React.useCallback(() => {
    setFontFamily("sharp-sans")
    setFontSizes({})
    document.dispatchEvent(new CustomEvent("vibezz:reset-in-page-typography"))
  }, [])

  const resetSpacing = React.useCallback(() => {
    setSpacing(DEFAULT_SPACING)
    document.dispatchEvent(new CustomEvent("vibezz:reset-in-page-spacing"))
  }, [])

  // Load Google Font when a non-local font is selected
  useLoadGoogleFont(fontFamily)

  // Apply live CSS overrides
  useApplyOverrides(fontFamily, fontSizes, spacing)

  const hasTypographyOverrides = fontFamily !== "sharp-sans" ||
    TYPOGRAPHY_LEVELS.some((l) => {
      const v = fontSizes[l.key]
      return v !== undefined && v !== l.defaultSize
    })
  const hasSpacingOverrides =
    spacing.paddingScale !== DEFAULT_MULTIPLIER ||
    spacing.marginScale !== DEFAULT_MULTIPLIER ||
    spacing.gapScale !== DEFAULT_MULTIPLIER ||
    ELEMENT_SPACING.some((el) => {
      const o = spacing.elements[el.key]
      return o && (o.px !== el.defaultPx || o.py !== el.defaultPy)
    })
  const hasOverrides = hasTypographyOverrides || hasSpacingOverrides

  // Listen for cross-tool deactivation event
  React.useEffect(() => {
    const handleDeactivate = () => setOpen(false)
    document.addEventListener("vibezz:deactivate-tools", handleDeactivate)
    return () => document.removeEventListener("vibezz:deactivate-tools", handleDeactivate)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-settings-ui
          aria-pressed={open || hasOverrides}
          title="Design settings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 32,
            padding: "0 10px",
            borderRadius: 6,
            border: open || hasOverrides
              ? "1.5px solid #059669"
              : "1.5px solid var(--stroke-default)",
            backgroundColor: open || hasOverrides
              ? "rgba(5, 150, 105, 0.1)"
              : "transparent",
            color: open || hasOverrides
              ? "#059669"
              : "var(--text-secondary)",
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
              backgroundColor: hasOverrides
                ? "#059669"
                : open
                  ? "#059669"
                  : "var(--text-disabled)",
              transition: "background-color 150ms ease",
            }}
          />
          settings
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] max-h-[70vh] overflow-y-auto p-0"
        data-settings-ui
      >
        <div className="p-3 border-b border-[var(--stroke-default)] flex items-center justify-between">
          <span className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)]">
            Design Settings
          </span>
          {hasOverrides && (
            <Button
              variant="tertiary"
              size="small"
              onClick={() => {
                resetTypography()
                resetSpacing()
                document.dispatchEvent(new CustomEvent("vibezz:reset-in-page"))
              }}
            >
              Reset all
            </Button>
          )}
        </div>
        <div className="p-3">
          <Tabs defaultValue="typography">
            <TabsList variant="segmented" fullWidth>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
            </TabsList>
            <TabsContent value="typography">
              <TypographySection
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSizes={fontSizes}
                setFontSize={handleSetFontSize}
                onReset={resetTypography}
              />
            </TabsContent>
            <TabsContent value="spacing">
              <SpacingSection
                spacing={spacing}
                setSpacing={setSpacing}
                onReset={resetSpacing}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
