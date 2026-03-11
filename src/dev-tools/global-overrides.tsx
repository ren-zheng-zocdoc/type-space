"use client"

import { useEffect, useCallback, useSyncExternalStore } from "react"
import {
  buildOverrideCSS,
  buildSettingsDescriptions,
  GOOGLE_FONT_MAP,
  DEFAULT_SPACING,
  type SpacingState,
} from "./settings-sections"

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "vibezz-global-overrides"
const STYLE_ID = "__vibezz-global-overrides"
const FONT_LINK_ID = "__vibezz-global-font"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobalOverrides {
  colorOverrides: Record<string, string>
  fontFamily: string
  fontSizes: Record<string, number>
  fontWeights: Record<string, number>
  spacing: SpacingState
}

const EMPTY_OVERRIDES: GlobalOverrides = {
  colorOverrides: {},
  fontFamily: "sharp-sans",
  fontSizes: {},
  fontWeights: {},
  spacing: DEFAULT_SPACING,
}

// ---------------------------------------------------------------------------
// Read / write helpers
// ---------------------------------------------------------------------------

export function readPersistedOverrides(): GlobalOverrides {
  if (typeof window === "undefined") return EMPTY_OVERRIDES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_OVERRIDES
    return { ...EMPTY_OVERRIDES, ...JSON.parse(raw) }
  } catch {
    return EMPTY_OVERRIDES
  }
}

function isSpacingDefault(spacing: SpacingState): boolean {
  if (spacing.paddingScale !== DEFAULT_SPACING.paddingScale) return false
  if (spacing.marginScale !== DEFAULT_SPACING.marginScale) return false
  if (spacing.gapScale !== DEFAULT_SPACING.gapScale) return false
  return Object.keys(spacing.elements).length === 0
}

export function persistOverrides(overrides: GlobalOverrides) {
  const isEmpty =
    Object.keys(overrides.colorOverrides).length === 0 &&
    overrides.fontFamily === "sharp-sans" &&
    Object.keys(overrides.fontSizes).length === 0 &&
    Object.keys(overrides.fontWeights).length === 0 &&
    isSpacingDefault(overrides.spacing)

  if (isEmpty) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  }

  // Notify all tabs/components that overrides changed
  window.dispatchEvent(new Event("vibezz-overrides-changed"))
}

export function clearPersistedOverrides() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("vibezz-overrides-changed"))
}

// ---------------------------------------------------------------------------
// Hook to subscribe to persisted overrides reactively
// ---------------------------------------------------------------------------

function subscribe(callback: () => void) {
  window.addEventListener("vibezz-overrides-changed", callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener("vibezz-overrides-changed", callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

function getServerSnapshot(): string {
  return ""
}

export function usePersistedOverrides(): GlobalOverrides {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  try {
    if (!raw) return EMPTY_OVERRIDES
    return { ...EMPTY_OVERRIDES, ...JSON.parse(raw) }
  } catch {
    return EMPTY_OVERRIDES
  }
}

// ---------------------------------------------------------------------------
// Global component that injects override CSS on every page
// ---------------------------------------------------------------------------

export function GlobalOverrideInjector() {
  const overrides = usePersistedOverrides()

  // Inject/remove the Google Font link
  useEffect(() => {
    const googleFamily = GOOGLE_FONT_MAP[overrides.fontFamily]
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
  }, [overrides.fontFamily])

  // Inject/remove the override style element
  useEffect(() => {
    const css = buildOverrideCSS(
      overrides.fontFamily,
      overrides.fontSizes,
      overrides.spacing,
      overrides.colorOverrides,
      overrides.fontWeights,
    )

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
    styleEl.setAttribute(
      "data-changes",
      buildSettingsDescriptions(
        overrides.fontFamily,
        overrides.fontSizes,
        overrides.spacing,
        overrides.fontWeights,
      ),
    )

    return () => {
      document.getElementById(STYLE_ID)?.remove()
    }
  }, [overrides])

  return null
}
