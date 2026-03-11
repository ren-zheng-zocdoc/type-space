# Design Settings Tool — Reusable Prompt

Add a **Design Settings** dev tool to the project. It lives in a popover triggered from a toolbar button and provides live, session-only CSS overrides for typography and spacing. No persistence — all changes reset on page reload.

---

## Architecture

Create a single `"use client"` React component (e.g. `settings-tool.tsx`) that:

1. Renders a **toolbar toggle button** (monospace label, colored dot indicator, inline styles so it's immune to its own overrides).
2. Opens a **Popover** with two tabs: **Typography** and **Spacing**.
3. Injects a `<style id="__settings-overrides">` element into `<head>` that is rebuilt on every state change.
4. Dynamically loads **Google Fonts** via an injected `<link>` element when a non-local font is selected.
5. Marks its own popover with `data-settings-ui` so override selectors can exclude it.

---

## Typography Tab

### Font Family
- Dropdown select with 17 font options:
  - **Project default** (the font already used by the project — set its `css` value to the project's CSS variable, e.g. `var(--font-sharp-sans), system-ui, sans-serif`)
  - **Google Fonts**: Inter, Roboto, Open Sans, Lato, Nunito Sans, Source Sans 3, DM Sans, Plus Jakarta Sans, Manrope, Outfit, Figtree, Geist
  - **System fonts**: SF Pro (macOS), Segoe UI (Windows), System UI
  - **Monospace**: ui-monospace, SF Mono, Fira Code
- When a Google Font is selected, inject `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">` into `<head>`.
- Override: `body { font-family: <selected-css> !important; }`

### Font Sizes (per hierarchy level)
- Define a `TYPOGRAPHY_LEVELS` array. Adapt to the project's actual type scale. Example:
  ```
  Display    28px / 36px line-height
  Title 1    28px / 32px
  Title 2    20px / 26px
  Title 3    18px / 24px
  Title 4    16px / 20px
  Body       16px / 26px
  Subbody    14px / 20px
  Caption    12px / 16px
  ```
- Each level gets a **TickSlider** (range 8–48px, step 4).
- Line-height scales proportionally: `newLh = round(newSize * (defaultLh / defaultSize))`.
- Override strategy depends on how the project applies font sizes:
  - **If using CSS variables** (e.g. `var(--font-size-body)`): override `:root { --font-size-body: Npx; }`.
  - **If using hardcoded Tailwind arbitrary values** (e.g. `text-[16px]`): target compiled selectors with `.text-\[16px\] { font-size: Npx !important; }`. Same for `leading-[Npx]` and responsive prefixes (`md:text-[...]`).
  - **If using Tailwind preset classes** (e.g. `text-sm`, `text-lg`): target those selectors directly.

---

## Spacing Tab

### Global Multipliers
Three sliders (range 0–3x, step 0.25, default 1x):
- **All padding** — scales every `p-*`, `px-*`, `py-*`, `pt/pb/pl/pr-*` utility
- **All margin** — scales every `m-*`, `mx-*`, `my-*`, `mt/mb/ml/mr-*` utility
- **All gap** — scales every `gap-*`, `space-y-*`, `space-x-*` utility

Override strategy for Tailwind v4 (which uses `calc(var(--spacing) * N)` where `--spacing: 0.25rem`):
```css
/* For each Tailwind spacing number N and multiplier M: */
.p-6:not([data-settings-ui]) { padding: calc(4 * 6 * M)px !important; }
```
Generate rules for common spacing values: `[0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16]`.

### Per-Element Overrides
Define an `ELEMENT_SPACING` array with entries for each UI element type. Each entry has:
- `key` — unique identifier
- `label` — display name
- `selector` — CSS selector targeting that element
- `defaultPx` / `defaultPy` — current horizontal/vertical padding in px
- `minP` / `maxP` — slider range

Adapt selectors to the project. Example entries:
| Element | Selector | Default Px | Default Py |
|---------|----------|-----------|-----------|
| Table cells | `table td` | 16 | 16 |
| Table headers | `table th` | 16 | 12 |
| Cards | `.rounded-lg[class*='border']` | 20 | 20 |
| Page content | `.flex-1.p-6` | 24 | 24 |
| Dialogs | `[role='dialog']:not([data-settings-ui])` | 24 | 24 |
| Buttons | `button:not([data-settings-ui] button)` | 20 | 0 |
| Inputs | `input:not([type='range']):not([data-settings-ui] input)` | 12 | 14 |
| Badges | (project-specific selector) | 6 | 2 |
| Flags/banners | (project-specific selector) | 16 | 16 |
| Section spacing | `.space-y-8:not([data-settings-ui])` | 0 | 32 |
| Page header | `header` | 16 | 8 |

Each element shows horizontal and vertical **TickSlider** controls (step 4).
For "Section spacing", override `margin-top` on children instead of padding.

---

## TickSlider Component

A reusable slider row with:
- **Range input** (`<input type="range">`) with configurable min/max/step (default step=4)
- **Editable text input** — syncs with slider, commits on blur or Enter, clamps to range
- **Unit label** (e.g. "px" or "x")
- **Reset button (↺)** — dimmed at 25% opacity when value equals default, full opacity when modified
- **Tick marks** below the slider at step increments, thinned to ~8–10 if too many

---

## Key Implementation Details

### Override Injection
```tsx
function useApplyOverrides(fontFamily, fontSizes, spacing) {
  useEffect(() => {
    const css = buildOverrideCSS(fontFamily, fontSizes, spacing)
    if (!css) { document.getElementById(STYLE_ID)?.remove(); return }
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement
    if (!el) { el = document.createElement("style"); el.id = STYLE_ID; document.head.appendChild(el) }
    el.textContent = css
    return () => { document.getElementById(STYLE_ID)?.remove() }
  }, [fontFamily, fontSizes, spacing])
}
```

### Google Fonts Loading
```tsx
function useLoadGoogleFont(fontFamily: string) {
  useEffect(() => {
    const family = GOOGLE_FONT_MAP[fontFamily]
    if (!family) { document.getElementById(FONT_LINK_ID)?.remove(); return }
    const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`
    let el = document.getElementById(FONT_LINK_ID) as HTMLLinkElement
    if (el) { if (el.href === href) return; el.href = href }
    else { el = document.createElement("link"); el.id = FONT_LINK_ID; el.rel = "stylesheet"; el.href = href; document.head.appendChild(el) }
    return () => { document.getElementById(FONT_LINK_ID)?.remove() }
  }, [fontFamily])
}
```

### Self-Exclusion
- Add `data-settings-ui` attribute to the popover content element.
- All global spacing selectors use `:not([data-settings-ui])` to avoid overriding the settings panel itself.
- Button/input selectors exclude children of `[data-settings-ui]`.

### Toolbar Button Style
Use **inline styles** (not Tailwind) for the toggle button so it's unaffected by overrides:
- Monospace font, 12px, font-weight 600
- 32px height, 6px border-radius
- Colored dot (8px circle) — green (#059669) when active/has overrides, gray when idle
- Green border + tinted background when active

### State Shape
```tsx
// Typography
const [fontFamily, setFontFamily] = useState("project-default")
const [fontSizes, setFontSizes] = useState<Record<string, number>>({})

// Spacing
interface SpacingState {
  paddingScale: number   // multiplier (default 1)
  marginScale: number    // multiplier (default 1)
  gapScale: number       // multiplier (default 1)
  elements: Record<string, { px: number; py: number }>
}
```

### Reset Buttons
- Each slider row has an individual ↺ reset button
- Font family section has a ↺ reset button
- Each tab has a "Reset all typography" / "Reset all spacing" button
- Header has a "Reset all" button when any overrides are active

---

## Adaptation Checklist

When adding to a new project:

1. **Identify the project's default font** — update the first entry in `FONT_FAMILIES` and the default value.
2. **Audit the type scale** — inspect the project's actual font sizes and line-heights. Update `TYPOGRAPHY_LEVELS` to match.
3. **Check how fonts are applied** — CSS variables vs hardcoded Tailwind classes vs preset classes. Adjust `buildOverrideCSS` accordingly.
4. **Check spacing system** — Tailwind v4 (`--spacing`) vs v3 (static utilities) vs custom. Adjust multiplier CSS generation.
5. **Update element selectors** — inspect the DOM to find the right selectors for cards, badges, flags, etc. in the target project.
6. **Swap UI primitives** — replace Popover, Tabs, Select, Button imports with whatever the project's component library provides (Radix, shadcn, Headless UI, etc.).
7. **Place the component** — add it to the project's toolbar/header alongside other dev tools.
