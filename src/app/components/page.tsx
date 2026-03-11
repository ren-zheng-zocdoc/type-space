"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import NextLink from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AvatarWithFallback,
  Badge,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Flag,
  Header,
  Icon,
  IconButton,
  Input,
  Link,
  Logo,
  Nav,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioCard,
  RadioField,
  RadioGroup,
  Section,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  SwitchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  TextareaField,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from "@/components/vibezz";
import { components, categories, type Category, type ComponentEntry } from "./registry";
import {
  ELEMENT_SPACING,
  DEFAULT_SPACING,
  type SpacingState,
  SliderRow,
  FONT_FAMILIES,
  TYPOGRAPHY_LEVELS as SETTINGS_TYPOGRAPHY_LEVELS,
} from "@/dev-tools/settings-sections";
import {
  readPersistedOverrides,
  persistOverrides,
  clearPersistedOverrides,
} from "@/dev-tools/global-overrides";


// =============================================================================
// Per-component spacing relevance
// =============================================================================

// Maps component id → which ELEMENT_SPACING keys apply.
// Components not listed here get no design edits.

const COMPONENT_SPACING_KEYS: Record<string, string[]> = {
  badge: ["badge"],
  button: ["button"],
  dialog: ["dialog"],
  drawer: ["dialog"],
  flag: ["flag"],
  header: ["header"],
  input: ["input"],
  nav: ["header"],
  select: ["input"],
  table: ["table-cell", "table-header"],
  textarea: ["input"],
};

// =============================================================================
// Color Data (from tokens.css)
// =============================================================================

interface ColorToken {
  name: string;
  variable: string;
  value: string;
}

interface ColorGroup {
  label: string;
  description: string;
  tokens: ColorToken[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Core",
    description: "Primary brand colors used for key surfaces and interactions.",
    tokens: [
      { name: "Yellow", variable: "--core-yellow", value: "#feed5a" },
      { name: "Charcoal", variable: "--core-charcoal", value: "#333333" },
      { name: "White", variable: "--core-white", value: "#ffffff" },
    ],
  },
  {
    label: "Text",
    description: "Use these for all text colors. Never hardcode hex values.",
    tokens: [
      { name: "Default", variable: "--text-default", value: "#333333" },
      { name: "Link", variable: "--text-link", value: "#333333" },
      { name: "Whisper", variable: "--text-whisper", value: "rgba(51,51,51,0.68)" },
      { name: "Placeholder", variable: "--text-placeholder", value: "rgba(51,51,51,0.68)" },
      { name: "Disabled", variable: "--text-disabled", value: "rgba(47,40,28,0.20)" },
      { name: "White", variable: "--text-white", value: "#ffffff" },
      { name: "Success", variable: "--text-success", value: "#15663a" },
      { name: "Error", variable: "--text-error", value: "#c62d2a" },
    ],
  },
  {
    label: "Icon",
    description: "Apply via className text-[var(--icon-default)] or inline style.",
    tokens: [
      { name: "Default", variable: "--icon-default", value: "#333333" },
      { name: "Whisper", variable: "--icon-whisper", value: "rgba(51,51,51,0.68)" },
      { name: "White", variable: "--icon-white", value: "#ffffff" },
      { name: "Success", variable: "--icon-success", value: "#039854" },
      { name: "Error", variable: "--icon-error", value: "#c62d2a" },
      { name: "Callout", variable: "--icon-callout", value: "#4e93f3" },
      { name: "New", variable: "--icon-new", value: "#f8cc30" },
      { name: "Disabled", variable: "--icon-disabled", value: "rgba(47,40,28,0.20)" },
    ],
  },
  {
    label: "Background",
    description: "Semantic background colors for surfaces, states, and brand.",
    tokens: [
      { name: "Default White", variable: "--background-default-white", value: "#ffffff" },
      { name: "Default Greige", variable: "--background-default-greige", value: "#f9f8f7" },
      { name: "Backdrop", variable: "--background-backdrop", value: "rgba(51,51,51,0.40)" },
      { name: "Success", variable: "--background-success", value: "#cbeddd" },
      { name: "Error", variable: "--background-error", value: "#ffe4e9" },
      { name: "Callout", variable: "--background-callout", value: "#dce9fd" },
      { name: "New", variable: "--background-new", value: "#fff0bb" },
      { name: "Disabled", variable: "--background-disabled", value: "rgba(58,47,31,0.10)" },
      { name: "Info", variable: "--background-info", value: "rgba(58,47,31,0.05)" },
    ],
  },
  {
    label: "Background Brand",
    description: "Brand-specific background pairs (light + dark) for themed sections.",
    tokens: [
      { name: "Yellow Light", variable: "--background-brand-yellow-light", value: "#fdfaee" },
      { name: "Yellow Dark", variable: "--background-brand-yellow-dark", value: "#fff0bb" },
      { name: "Orange Light", variable: "--background-brand-orange-light", value: "#ffe3c9" },
      { name: "Orange Dark", variable: "--background-brand-orange-dark", value: "#ff8a56" },
      { name: "Teal Light", variable: "--background-brand-teal-light", value: "#d3f5ff" },
      { name: "Teal Dark", variable: "--background-brand-teal-dark", value: "#19809a" },
      { name: "Green Light", variable: "--background-brand-green-light", value: "#cbeddd" },
      { name: "Green Dark", variable: "--background-brand-green-dark", value: "#15663a" },
      { name: "Blue Light", variable: "--background-brand-blue-light", value: "#dce9fd" },
      { name: "Blue Dark", variable: "--background-brand-blue-dark", value: "#2c64d8" },
      { name: "Charcoal", variable: "--background-brand-charcoal", value: "#333333" },
    ],
  },
  {
    label: "Stroke",
    description: "Border and divider colors for inputs, cards, and outlines.",
    tokens: [
      { name: "Charcoal", variable: "--stroke-charcoal", value: "#333333" },
      { name: "UI", variable: "--stroke-ui", value: "rgba(47,40,28,0.20)" },
      { name: "Default", variable: "--stroke-default", value: "rgba(58,47,31,0.10)" },
      { name: "Keyboard", variable: "--stroke-keyboard", value: "#4e93f3" },
      { name: "Disabled", variable: "--stroke-disabled", value: "rgba(47,40,28,0.20)" },
      { name: "Error", variable: "--stroke-error", value: "#f84141" },
    ],
  },
  {
    label: "State",
    description: "Interactive state colors for hover, pressed, and selected.",
    tokens: [
      { name: "Hover", variable: "--state-hover", value: "rgba(58,47,31,0.05)" },
      { name: "Pressed", variable: "--state-pressed", value: "rgba(58,47,31,0.10)" },
      { name: "Selected Light", variable: "--state-selected-light", value: "rgba(58,47,31,0.05)" },
      { name: "Selected Dark", variable: "--state-selected-dark", value: "#333333" },
      { name: "Brand Hover", variable: "--state-brand-hover", value: "#fee049" },
      { name: "Brand Pressed", variable: "--state-brand-pressed", value: "#fdd832" },
    ],
  },
  {
    label: "Base Palette",
    description: "Raw color scale. Do NOT use directly — use semantic tokens above.",
    tokens: [
      { name: "Red 80", variable: "--color-red-80", value: "#c62d2a" },
      { name: "Red 70", variable: "--color-red-70", value: "#f84141" },
      { name: "Red 20", variable: "--color-red-20", value: "#ffbbc7" },
      { name: "Red 10", variable: "--color-red-10", value: "#ffe4e9" },
      { name: "Red 5", variable: "--color-red-5", value: "#ffecf0" },
      { name: "Orange 50", variable: "--color-orange-50", value: "#fd6c37" },
      { name: "Orange 40", variable: "--color-orange-40", value: "#ff8a56" },
      { name: "Orange 20", variable: "--color-orange-20", value: "#ffc794" },
      { name: "Orange 10", variable: "--color-orange-10", value: "#ffe3c9" },
      { name: "Orange 5", variable: "--color-orange-5", value: "#ffebd9" },
      { name: "Yellow 100", variable: "--color-yellow-100", value: "#f8cc30" },
      { name: "Yellow 90", variable: "--color-yellow-90", value: "#fdd832" },
      { name: "Yellow 80", variable: "--color-yellow-80", value: "#fee049" },
      { name: "Yellow 70", variable: "--color-yellow-70", value: "#fde721" },
      { name: "Yellow 50", variable: "--color-yellow-50", value: "#feed5a" },
      { name: "Yellow 20", variable: "--color-yellow-20", value: "#fff0bb" },
      { name: "Yellow 10", variable: "--color-yellow-10", value: "#fdfaee" },
      { name: "Yellow 5", variable: "--color-yellow-5", value: "#fefcf3" },
      { name: "Teal 80", variable: "--color-teal-80", value: "#19809a" },
      { name: "Teal 40", variable: "--color-teal-40", value: "#59cae7" },
      { name: "Teal 30", variable: "--color-teal-30", value: "#a9e8f8" },
      { name: "Teal 10", variable: "--color-teal-10", value: "#d3f5ff" },
      { name: "Teal 5", variable: "--color-teal-5", value: "#e0f8ff" },
      { name: "Blue 90", variable: "--color-blue-90", value: "#2755b6" },
      { name: "Blue 80", variable: "--color-blue-80", value: "#2c64d8" },
      { name: "Blue 60", variable: "--color-blue-60", value: "#4e93f3" },
      { name: "Blue 10", variable: "--color-blue-10", value: "#dce9fd" },
      { name: "Blue 5", variable: "--color-blue-5", value: "#e7f0fe" },
      { name: "Green 90", variable: "--color-green-90", value: "#15663a" },
      { name: "Green 70", variable: "--color-green-70", value: "#039854" },
      { name: "Green 50", variable: "--color-green-50", value: "#5fc69b" },
      { name: "Green 10", variable: "--color-green-10", value: "#cbeddd" },
      { name: "Green 5", variable: "--color-green-5", value: "#dbf2e7" },
      { name: "Charcoal 90", variable: "--color-charcoal-90", value: "#333333" },
      { name: "Greige 10", variable: "--color-greige-10", value: "#f9f8f7" },
      { name: "Greige 5", variable: "--color-greige-5", value: "#fbfaf9" },
      { name: "White", variable: "--color-white", value: "#ffffff" },
    ],
  },
];

// =============================================================================
// Typography Data (from tokens.css)
// =============================================================================

interface TypographyLevel {
  name: string;
  size: string;
  lineHeight: string;
  weight: string;
  sizeVar: string;
  lhVar: string;
  sample: string;
}

const TYPOGRAPHY_LEVELS: TypographyLevel[] = [
  { name: "Display", size: "28px", lineHeight: "36px", weight: "Semibold (600)", sizeVar: "--font-size-display", lhVar: "--line-height-display", sample: "Display heading" },
  { name: "Title 1", size: "28px", lineHeight: "32px", weight: "Semibold (600)", sizeVar: "--font-size-title-1", lhVar: "--line-height-title-1", sample: "Title one heading" },
  { name: "Title 2", size: "20px", lineHeight: "26px", weight: "Semibold (600)", sizeVar: "--font-size-title-2", lhVar: "--line-height-title-2", sample: "Title two heading" },
  { name: "Title 3", size: "18px", lineHeight: "24px", weight: "Semibold (600)", sizeVar: "--font-size-title-3", lhVar: "--line-height-title-3", sample: "Title three heading" },
  { name: "Title 4", size: "16px", lineHeight: "20px", weight: "Semibold (600)", sizeVar: "--font-size-title-4", lhVar: "--line-height-title-4", sample: "Title four heading" },
  { name: "Body", size: "16px", lineHeight: "26px", weight: "Medium (500)", sizeVar: "--font-size-body", lhVar: "--line-height-body", sample: "Body text used for paragraphs and general content across the application." },
  { name: "Subbody", size: "14px", lineHeight: "20px", weight: "Medium (500)", sizeVar: "--font-size-subbody", lhVar: "--line-height-subbody", sample: "Subbody text for secondary information and supporting content." },
  { name: "Caption", size: "12px", lineHeight: "16px", weight: "Medium (500)", sizeVar: "--font-size-caption", lhVar: "--line-height-caption", sample: "Caption text for labels and metadata." },
];

const FONT_WEIGHTS = [
  { name: "Medium", value: "500", variable: "--font-weight-medium", usage: "Body text, form labels, secondary content" },
  { name: "Semibold", value: "600", variable: "--font-weight-semibold", usage: "Headings, buttons, emphasis. Most common weight." },
];

// =============================================================================
// Colors Tab
// =============================================================================

function ColorsTab({
  colorOverrides,
  setColorOverrides,
  pushed,
  onPush,
  onReset,
}: {
  colorOverrides: Record<string, string>;
  setColorOverrides: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  pushed: boolean;
  onPush: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(`var(${variable})`);
    setCopied(variable);
    setTimeout(() => setCopied(null), 1500);
  };

  const pendingCount = Object.keys(colorOverrides).length;

  // Convert rgba/named colors to hex for color input (best effort)
  const toHex = (value: string): string => {
    if (value.startsWith("#")) {
      // Expand shorthand #abc → #aabbcc
      if (value.length === 4) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
      }
      return value;
    }
    return "#000000";
  };

  return (
    <div className="space-y-10">
      {/* Action bar */}
      {(pendingCount > 0 || pushed) && (
        <div className="flex items-center gap-3">
          {pendingCount > 0 && !pushed && (
            <Button variant="primary" onClick={onPush}>
              Push Edits to All Instances
            </Button>
          )}
          {pushed && (
            <Flag color="green" title="Overrides active" showIcon>
              {pendingCount} color{pendingCount !== 1 ? "s" : ""} pushed site-wide.
            </Flag>
          )}
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      )}

      {COLOR_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
            {group.label}
          </h3>
          <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-whisper)]">
            {group.description}
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.tokens.map((token) => {
              const isModified = token.variable in colorOverrides;
              const displayColor = colorOverrides[token.variable] ?? token.value;

              return (
                <div
                  key={token.variable}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors text-left ${
                    isModified
                      ? "border-[var(--stroke-charcoal)]"
                      : "border-[var(--stroke-default)] hover:border-[var(--stroke-charcoal)]"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-md border border-[var(--stroke-default)] flex-shrink-0"
                    style={{ backgroundColor: displayColor }}
                  />
                  <button
                    onClick={() => handleCopy(token.variable)}
                    className="min-w-0 flex-1 cursor-pointer text-left bg-transparent border-none p-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)]">
                        {token.name}
                      </span>
                      {isModified && <Badge variant="yellow-dark">Modified</Badge>}
                    </div>
                    <div className="text-[12px] leading-[16px] text-[var(--text-whisper)] truncate">
                      {copied === token.variable ? (
                        <span className="text-[var(--text-success)]">Copied!</span>
                      ) : (
                        <code>{token.variable}</code>
                      )}
                    </div>
                    <div className="text-[11px] leading-[14px] text-[var(--text-whisper)]">
                      {isModified ? (
                        <>
                          <span className="line-through">{token.value}</span>{" "}
                          <span className="text-[var(--text-default)]">{colorOverrides[token.variable]}</span>
                        </>
                      ) : (
                        token.value
                      )}
                    </div>
                  </button>
                  <div className="relative flex-shrink-0">
                    <IconButton
                      icon="edit"
                      size="small"
                      aria-label={`Edit ${token.name}`}
                    />
                    <input
                      type="color"
                      value={toHex(displayColor)}
                      onChange={(e) =>
                        setColorOverrides((prev) => ({
                          ...prev,
                          [token.variable]: e.target.value,
                        }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title={`Edit ${token.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Typography Tab
// =============================================================================

function TypographyTab({
  fontFamily,
  setFontFamily,
  fontSizes,
  setFontSizes,
  fontWeights,
  setFontWeights,
  pushed,
  onPush,
  onReset,
}: {
  fontFamily: string;
  setFontFamily: (v: string) => void;
  fontSizes: Record<string, number>;
  setFontSizes: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  fontWeights: Record<string, number>;
  setFontWeights: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  pushed: boolean;
  onPush: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const hasChanges = useMemo(() => {
    if (fontFamily !== "sharp-sans") return true;
    for (const level of SETTINGS_TYPOGRAPHY_LEVELS) {
      if (fontSizes[level.key] !== undefined && fontSizes[level.key] !== level.defaultSize) return true;
      const defaultWeight = level.key.startsWith("title") || level.key === "display" ? 600 : 500;
      if (fontWeights[level.key] !== undefined && fontWeights[level.key] !== defaultWeight) return true;
    }
    return false;
  }, [fontFamily, fontSizes, fontWeights]);

  const selectedFontLabel = FONT_FAMILIES.find((f) => f.value === fontFamily)?.label ?? "Sharp Sans";

  return (
    <div className="space-y-10">
      {/* Action bar */}
      {(hasChanges || pushed) && (
        <div className="flex items-center gap-3">
          {hasChanges && !pushed && (
            <Button variant="primary" onClick={onPush}>
              Push Edits to All Instances
            </Button>
          )}
          {pushed && (
            <Flag color="green" title="Overrides active" showIcon>
              Typography overrides pushed site-wide.
            </Flag>
          )}
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      )}

      {/* Font Family */}
      <div>
        <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
          Font Family
        </h3>
        <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-whisper)]">
          Choose a typeface for the entire site. Loaded via next/font/local or Google Fonts.
        </p>
        <div className="mt-4">
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="w-[280px]">
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
        <div className="mt-4 rounded-lg border border-[var(--stroke-default)] p-5">
          <p className="text-[28px] leading-[36px] font-semibold text-[var(--text-default)]">
            {selectedFontLabel}
          </p>
          <p className="mt-2 text-[16px] leading-[26px] text-[var(--text-whisper)]">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
            abcdefghijklmnopqrstuvwxyz<br />
            0123456789
          </p>
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
          Font Weights
        </h3>
        <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-whisper)]">
          Only use font-medium (500) and font-semibold (600). Never use font-bold.
        </p>
        <div className="mt-4 space-y-3">
          {FONT_WEIGHTS.map((w) => (
            <div
              key={w.name}
              className="rounded-lg border border-[var(--stroke-default)] p-4 flex items-center justify-between"
            >
              <div>
                <span
                  className="text-[20px] leading-[26px] text-[var(--text-default)]"
                  style={{ fontWeight: Number(w.value) }}
                >
                  {w.name} ({w.value})
                </span>
                <p className="mt-1 text-[12px] leading-[16px] text-[var(--text-whisper)]">
                  {w.usage}
                </p>
              </div>
              <Badge variant="charcoal">{w.variable}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Type Scale */}
      <div>
        <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
          Type Scale
        </h3>
        <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-whisper)]">
          Eight levels from Display (28px) to Caption (12px). Adjust font size and weight per level.
        </p>
        <div className="mt-4 space-y-3">
          {TYPOGRAPHY_LEVELS.map((level) => {
            const settingsLevel = SETTINGS_TYPOGRAPHY_LEVELS.find((l) => l.label === level.name);
            const levelKey = settingsLevel?.key ?? "";
            const currentSize = fontSizes[levelKey] ?? parseInt(level.size);
            const defaultWeight = level.weight.includes("Semibold") ? 600 : 500;
            const currentWeight = fontWeights[levelKey] ?? defaultWeight;
            const ratio = parseInt(level.lineHeight) / parseInt(level.size);
            const currentLineHeight = Math.round(currentSize * ratio);
            const sizeModified = fontSizes[levelKey] !== undefined && fontSizes[levelKey] !== parseInt(level.size);
            const weightModified = fontWeights[levelKey] !== undefined && fontWeights[levelKey] !== defaultWeight;

            return (
              <div
                key={level.name}
                className={`w-full rounded-lg border p-5 ${
                  sizeModified || weightModified
                    ? "border-[var(--stroke-charcoal)]"
                    : "border-[var(--stroke-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(`font-size: var(${level.sizeVar}); line-height: var(${level.lhVar});`)}
                      className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] hover:text-[var(--text-link)] cursor-pointer bg-transparent border-none p-0"
                    >
                      {level.name}
                    </button>
                    {(sizeModified || weightModified) && <Badge variant="yellow-dark">Modified</Badge>}
                  </div>
                  {copied === `font-size: var(${level.sizeVar}); line-height: var(${level.lhVar});` ? (
                    <span className="text-[12px] leading-[16px] text-[var(--text-success)]">Copied!</span>
                  ) : (
                    <code className="text-[11px] leading-[14px] text-[var(--text-whisper)]">
                      {level.sizeVar}
                    </code>
                  )}
                </div>

                <div className="flex gap-5">
                  {/* Sample preview — left side */}
                  <p
                    className="flex-1 min-w-0 text-[var(--text-default)]"
                    style={{
                      fontSize: `${currentSize}px`,
                      lineHeight: `${currentLineHeight}px`,
                      fontWeight: currentWeight,
                    }}
                  >
                    {level.sample}
                  </p>

                  {/* Controls — right side */}
                  <div className="flex-shrink-0 flex flex-col gap-2 justify-center">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[12px] leading-[16px] text-[var(--text-whisper)] w-[42px]">Size</label>
                      <Input
                        size="small"
                        type="number"
                        value={currentSize}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v >= 8 && v <= 72) {
                            setFontSizes((prev) => ({ ...prev, [levelKey]: v }));
                          }
                        }}
                        className="w-[70px]"
                      />
                      <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">px</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[12px] leading-[16px] text-[var(--text-whisper)] w-[42px]">Weight</label>
                      <Select
                        value={String(currentWeight)}
                        onValueChange={(v) =>
                          setFontWeights((prev) => ({ ...prev, [levelKey]: parseInt(v) }))
                        }
                      >
                        <SelectTrigger size="small" className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">Medium (500)</SelectItem>
                          <SelectItem value="600">Semibold (600)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Component Previews
// =============================================================================

function ComponentPreview({ id }: { id: string }) {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState<boolean | "indeterminate">(false);
  const [page, setPage] = useState(3);
  const [selectValue, setSelectValue] = useState("");
  const [radioValue, setRadioValue] = useState("option1");
  const { toast } = useToast();

  const previews: Record<string, React.ReactNode> = {
    accordion: (
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Vibezz?</AccordionTrigger>
          <AccordionContent>
            A design system with 40+ production-ready components.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I get started?</AccordionTrigger>
          <AccordionContent>
            Import components from @/components/vibezz.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
    avatar: (
      <div className="flex items-center gap-3">
        <AvatarWithFallback size="32" fallback="AB" alt="User A" />
        <AvatarWithFallback size="40" fallback="CD" alt="User B" />
        <AvatarWithFallback size="56" fallback="EF" alt="User C" />
      </div>
    ),
    badge: (
      <div className="flex flex-wrap gap-2">
        <Badge variant="yellow-dark">Default</Badge>
        <Badge variant="positive">Success</Badge>
        <Badge variant="negative">Error</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="charcoal">Neutral</Badge>
        <Badge variant="callout">Callout</Badge>
      </div>
    ),
    button: (
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    ),
    checkbox: (
      <div className="space-y-3">
        <Checkbox
          label="Accept terms and conditions"
          checked={checkboxChecked}
          onCheckedChange={setCheckboxChecked}
        />
        <Checkbox label="Subscribe to newsletter" />
      </div>
    ),
    dialog: (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    drawer: (
      <div className="rounded-md border border-dashed border-[var(--stroke-default)] p-4 text-center">
        <Icon name="swipe_left" size="24" className="text-[var(--text-whisper)] mx-auto" />
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
          You&apos;re viewing this inside a Drawer right now.
        </p>
      </div>
    ),
    flag: (
      <div className="space-y-3">
        <Flag color="green" title="Success" showIcon>
          Your changes have been saved successfully.
        </Flag>
        <Flag color="blue" title="Information" showIcon>
          A new version is available.
        </Flag>
      </div>
    ),
    icon: (
      <div className="flex items-center gap-4">
        <Icon name="home" size="24" />
        <Icon name="settings" size="24" />
        <Icon name="search" size="24" />
        <Icon name="check_circle" size="24" filled />
        <Icon name="star" size="24" filled />
        <Icon name="favorite" size="24" filled />
      </div>
    ),
    input: (
      <div className="space-y-3">
        <TextField label="Email" placeholder="you@example.com" required />
        <TextField label="Password" type="password" placeholder="Enter password" />
      </div>
    ),
    link: (
      <div className="space-y-2">
        <div><Link href="#">Default link</Link></div>
        <div><Link href="#" size="small">Small link</Link></div>
      </div>
    ),
    logo: (
      <div className="flex items-center gap-6">
        <Logo variant="wordmark" size="small" />
        <Logo variant="icon" size="medium" />
      </div>
    ),
    header: (
      <Header title="Page Title" subbody="A descriptive subtitle for the page." />
    ),
    nav: (
      <div className="rounded-md border border-[var(--stroke-default)] overflow-hidden">
        <Nav left={<Logo size="small" />} right={<Button size="small">Sign in</Button>} />
      </div>
    ),
    progress: (
      <div className="space-y-4">
        <Progress value={60} />
        <Progress value={30} size="small" />
      </div>
    ),
    popover: (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            <p className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)]">Popover Title</p>
            <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">Additional context or actions can go here.</p>
          </div>
        </PopoverContent>
      </Popover>
    ),
    pagination: (
      <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
    ),
    radio: (
      <RadioGroup value={radioValue} onValueChange={setRadioValue}>
        <RadioField label="Option A" value="option1" />
        <RadioField label="Option B" value="option2" description="With supporting text" />
      </RadioGroup>
    ),
    "radio-cards": (
      <RadioGroup value={radioValue} onValueChange={setRadioValue}>
        <RadioCard label="Premium" description="$10/month with all features" value="option1" />
        <RadioCard label="Basic" description="Free with limited features" value="option2" />
      </RadioGroup>
    ),
    "radio-group": (
      <RadioGroup label="Choose an option" value={radioValue} onValueChange={setRadioValue}>
        <RadioField label="Small" value="option1" />
        <RadioField label="Medium" value="option2" />
        <RadioField label="Large" value="option3" />
      </RadioGroup>
    ),
    section: (
      <div className="rounded-md border border-dashed border-[var(--stroke-default)] p-4 text-center">
        <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
          Section is a layout primitive that adds vertical padding (py). Sizes: 1 (32px), 2 (48px), 3 (80px), 4 (128px).
        </p>
      </div>
    ),
    select: (
      <Select value={selectValue} onValueChange={setSelectValue}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    ),
    switch: (
      <div className="space-y-3">
        <SwitchField label="Enable notifications" checked={switchChecked} onCheckedChange={setSwitchChecked} />
        <SwitchField label="Dark mode" description="Toggle dark theme" />
      </div>
    ),
    table: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Alice</TableCell>
            <TableCell>Engineer</TableCell>
            <TableCell><Badge variant="positive">Active</Badge></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Bob</TableCell>
            <TableCell>Designer</TableCell>
            <TableCell><Badge variant="info">Away</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
    tabs: (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] pt-3">Overview content goes here.</p>
        </TabsContent>
        <TabsContent value="details">
          <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] pt-3">Details content goes here.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] pt-3">Settings content goes here.</p>
        </TabsContent>
      </Tabs>
    ),
    textarea: (
      <TextareaField label="Message" placeholder="Type your message here..." rows={3} />
    ),
    toast: (
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Changes saved", description: "Your preferences have been updated." })}
      >
        Show Toast
      </Button>
    ),
    tooltip: (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>This is a helpful tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    map: (
      <div className="rounded-md border border-dashed border-[var(--stroke-default)] p-4 text-center">
        <Icon name="map" size="24" className="text-[var(--text-whisper)] mx-auto" />
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">Map requires a Google Maps API key to render.</p>
      </div>
    ),
    "times-grid": (
      <div className="rounded-md border border-dashed border-[var(--stroke-default)] p-4 text-center">
        <Icon name="calendar_month" size="24" className="text-[var(--text-whisper)] mx-auto" />
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">Times Grid requires availability data to render.</p>
      </div>
    ),
    "times-grid-empty": (
      <div className="rounded-md border border-dashed border-[var(--stroke-default)] p-4 text-center">
        <Icon name="event_busy" size="24" className="text-[var(--text-whisper)] mx-auto" />
        <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">Empty state shown when no availability exists.</p>
      </div>
    ),
  };

  const preview = previews[id];
  if (!preview) return null;

  return (
    <div>
      <h4 className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-3">Preview</h4>
      <div className="rounded-lg border border-[var(--stroke-default)] p-5 bg-[var(--background-default-white)]">
        {preview}
      </div>
    </div>
  );
}

// =============================================================================
// Per-component design edits (shown under preview)
// =============================================================================

function ComponentDesignEditsSection({
  componentId,
  spacing,
  setSpacing,
  resetSpacing,
}: {
  componentId: string;
  spacing: SpacingState;
  setSpacing: (fn: (prev: SpacingState) => SpacingState) => void;
  resetSpacing: () => void;
}) {
  const spacingKeys = COMPONENT_SPACING_KEYS[componentId];
  if (!spacingKeys) return null;

  const relevantSpacing = ELEMENT_SPACING.filter((e) => spacingKeys.includes(e.key));
  if (relevantSpacing.length === 0) return null;

  const hasOverrides = relevantSpacing.some((el) => {
    const o = spacing.elements[el.key];
    return o && (o.px !== el.defaultPx || o.py !== el.defaultPy);
  });

  return (
    <div data-settings-ui className="rounded-lg border border-[var(--stroke-default)] p-4 space-y-4">
      <h4 className="text-[12px] leading-[16px] font-semibold text-[var(--text-whisper)] uppercase tracking-wide">
        Spacing &amp; Padding
      </h4>

      {relevantSpacing.map((el) => {
        const override = spacing.elements[el.key];
        const px = override?.px ?? el.defaultPx;
        const py = override?.py ?? el.defaultPy;
        return (
          <div key={el.key} className="space-y-2">
            {relevantSpacing.length > 1 && (
              <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                {el.label}
              </span>
            )}
            {el.defaultPx > 0 && (
              <SliderRow
                label="Horizontal padding"
                value={px}
                defaultValue={el.defaultPx}
                min={el.minP}
                max={el.maxP}
                onChange={(v) =>
                  setSpacing((s) => {
                    const prev = s.elements[el.key] ?? { px: el.defaultPx, py: el.defaultPy };
                    return { ...s, elements: { ...s.elements, [el.key]: { ...prev, px: v } } };
                  })
                }
                onReset={() =>
                  setSpacing((s) => {
                    const prev = s.elements[el.key] ?? { px: el.defaultPx, py: el.defaultPy };
                    return { ...s, elements: { ...s.elements, [el.key]: { ...prev, px: el.defaultPx } } };
                  })
                }
              />
            )}
            {el.defaultPy > 0 && (
              <SliderRow
                label="Vertical padding"
                value={py}
                defaultValue={el.defaultPy}
                min={el.minP}
                max={el.maxP}
                onChange={(v) =>
                  setSpacing((s) => {
                    const prev = s.elements[el.key] ?? { px: el.defaultPx, py: el.defaultPy };
                    return { ...s, elements: { ...s.elements, [el.key]: { ...prev, py: v } } };
                  })
                }
                onReset={() =>
                  setSpacing((s) => {
                    const prev = s.elements[el.key] ?? { px: el.defaultPx, py: el.defaultPy };
                    return { ...s, elements: { ...s.elements, [el.key]: { ...prev, py: el.defaultPy } } };
                  })
                }
              />
            )}
          </div>
        );
      })}

      {hasOverrides && (
        <Button
          variant="secondary"
          size="small"
          className="w-full"
          onClick={resetSpacing}
        >
          Reset spacing
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// Components Tab
// =============================================================================

function ComponentsTab({
  spacing,
  setSpacing,
  resetSpacing,
  spacingPushed,
  onSpacingPush,
  onSpacingReset,
}: {
  spacing: SpacingState;
  setSpacing: (fn: (prev: SpacingState) => SpacingState) => void;
  resetSpacing: () => void;
  spacingPushed: boolean;
  onSpacingPush: () => void;
  onSpacingReset: () => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedComponent, setSelectedComponent] = useState<ComponentEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = components.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleComponentClick = (component: ComponentEntry) => {
    setSelectedComponent(component);
    setDrawerOpen(true);
  };

  const hasSpacingChanges = useMemo(() => {
    if (spacing.paddingScale !== DEFAULT_SPACING.paddingScale) return true;
    if (spacing.marginScale !== DEFAULT_SPACING.marginScale) return true;
    if (spacing.gapScale !== DEFAULT_SPACING.gapScale) return true;
    return ELEMENT_SPACING.some((el) => {
      const o = spacing.elements[el.key];
      return o && (o.px !== el.defaultPx || o.py !== el.defaultPy);
    });
  }, [spacing]);

  return (
    <>
      {/* Spacing push action bar */}
      {(hasSpacingChanges || spacingPushed) && (
        <div className="mt-4 flex items-center gap-3">
          {hasSpacingChanges && !spacingPushed && (
            <Button variant="primary" onClick={onSpacingPush}>
              Push Edits to All Instances
            </Button>
          )}
          {spacingPushed && (
            <Flag color="green" title="Overrides active" showIcon>
              Spacing overrides pushed site-wide.
            </Flag>
          )}
          <Button variant="secondary" onClick={onSpacingReset}>
            Reset
          </Button>
        </div>
      )}

      <div className="mt-4 mb-4">
        <Input
          placeholder="Search components..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
          {filtered.length} component{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as Category)}
      >
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                  className="group text-left rounded-lg border border-[var(--stroke-default)] p-5 transition-colors hover:border-[var(--stroke-charcoal)] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)] group-hover:text-[var(--text-link)]">
                      {component.name}
                    </h3>
                    <Badge variant="charcoal">{component.category}</Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)] line-clamp-2">
                    {component.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {component.variants.length > 0 && (
                      <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">
                        {component.variants.length} variant{component.variants.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {component.properties.length > 0 && (
                      <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">
                        {component.properties.length} prop{component.properties.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-12 text-center">
                <Icon name="search_off" size="40" className="text-[var(--text-whisper)]" />
                <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  No components match your search.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {selectedComponent && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selectedComponent.name}</DrawerTitle>
                <DrawerDescription>{selectedComponent.description}</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <div className="space-y-6">
                  <ComponentPreview id={selectedComponent.id} />

                  <ComponentDesignEditsSection
                    componentId={selectedComponent.id}
                    spacing={spacing}
                    setSpacing={setSpacing}
                    resetSpacing={resetSpacing}
                  />

                  <div>
                    <h4 className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-2">Import</h4>
                    <div className="rounded-md bg-[var(--background-default-greige)] p-3">
                      <code className="text-[13px] leading-[20px] text-[var(--text-default)]">
                        {`import { ${selectedComponent.name} } from "@/components/vibezz"`}
                      </code>
                    </div>
                  </div>

                  {selectedComponent.variants.length > 0 && (
                    <div>
                      <h4 className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-2">Variants</h4>
                      <div className="space-y-2">
                        {selectedComponent.variants.map((v) => (
                          <div key={v.id} className="rounded-md border border-[var(--stroke-default)] p-3">
                            <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">{v.name}</span>
                            {v.description && (
                              <p className="mt-0.5 text-[12px] leading-[16px] text-[var(--text-secondary)]">{v.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedComponent.properties.length > 0 && (
                    <div>
                      <h4 className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-2">Properties</h4>
                      <div className="space-y-2">
                        {selectedComponent.properties.map((p) => (
                          <div key={p.name} className="rounded-md border border-[var(--stroke-default)] p-3">
                            <div className="flex items-center gap-2">
                              <code className="text-[13px] leading-[20px] font-medium text-[var(--text-default)]">{p.name}</code>
                              <Badge variant="info">{p.type}</Badge>
                            </div>
                            {p.options && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {p.options.map((opt) => (
                                  <Badge key={opt} variant={String(p.defaultValue) === opt ? "yellow-dark" : "charcoal"}>{opt}</Badge>
                                ))}
                              </div>
                            )}
                            {p.type === "boolean" && (
                              <p className="mt-1 text-[12px] leading-[16px] text-[var(--text-whisper)]">Default: {String(p.defaultValue)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-2">Source</h4>
                    <div className="rounded-md bg-[var(--background-default-greige)] p-3">
                      <code className="text-[13px] leading-[20px] text-[var(--text-secondary)]">
                        src/components/vibezz/{selectedComponent.id}.tsx
                      </code>
                    </div>
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState("components");

  // Color overrides
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});
  const [colorsPushed, setColorsPushed] = useState(false);

  // Typography overrides
  const [fontFamily, setFontFamily] = useState("sharp-sans");
  const [fontSizes, setFontSizes] = useState<Record<string, number>>({});
  const [fontWeights, setFontWeights] = useState<Record<string, number>>({});
  const [typoPushed, setTypoPushed] = useState(false);

  // Spacing state
  const [spacing, setSpacing] = useState<SpacingState>(DEFAULT_SPACING);
  const [spacingPushed, setSpacingPushed] = useState(false);

  // Hydrate editing state from persisted overrides on mount
  useEffect(() => {
    const persisted = readPersistedOverrides();
    const hasColors = Object.keys(persisted.colorOverrides).length > 0;
    const hasTypo =
      persisted.fontFamily !== "sharp-sans" ||
      Object.keys(persisted.fontSizes).length > 0 ||
      Object.keys(persisted.fontWeights).length > 0;
    const hasSpacing =
      persisted.spacing.paddingScale !== DEFAULT_SPACING.paddingScale ||
      persisted.spacing.marginScale !== DEFAULT_SPACING.marginScale ||
      persisted.spacing.gapScale !== DEFAULT_SPACING.gapScale ||
      Object.keys(persisted.spacing.elements).length > 0;

    if (hasColors) {
      setColorOverrides(persisted.colorOverrides);
      setColorsPushed(true);
    }
    if (hasTypo) {
      setFontFamily(persisted.fontFamily);
      setFontSizes(persisted.fontSizes);
      setFontWeights(persisted.fontWeights);
      setTypoPushed(true);
    }
    if (hasSpacing) {
      setSpacing(persisted.spacing);
      setSpacingPushed(true);
    }
  }, []);

  const handleSpacingPush = useCallback(() => {
    setSpacingPushed(true);
    const persisted = readPersistedOverrides();
    persistOverrides({ ...persisted, spacing });
  }, [spacing]);

  const handleSpacingReset = useCallback(() => {
    setSpacing(DEFAULT_SPACING);
    setSpacingPushed(false);
    document.dispatchEvent(new CustomEvent("vibezz:reset-in-page-spacing"));
    const persisted = readPersistedOverrides();
    persistOverrides({ ...persisted, spacing: DEFAULT_SPACING });
  }, []);

  const handleColorPush = useCallback(() => {
    setColorsPushed(true);
    // Persist and notify the global injector
    const persisted = readPersistedOverrides();
    persistOverrides({ ...persisted, colorOverrides });
  }, [colorOverrides]);

  const handleColorReset = useCallback(() => {
    setColorOverrides({});
    setColorsPushed(false);
    const persisted = readPersistedOverrides();
    persistOverrides({ ...persisted, colorOverrides: {} });
  }, []);

  const handleTypoPush = useCallback(() => {
    setTypoPushed(true);
    const persisted = readPersistedOverrides();
    persistOverrides({ ...persisted, fontFamily, fontSizes, fontWeights });
  }, [fontFamily, fontSizes, fontWeights]);

  const handleTypoReset = useCallback(() => {
    setFontFamily("sharp-sans");
    setFontSizes({});
    setFontWeights({});
    setTypoPushed(false);
    const persisted = readPersistedOverrides();
    persistOverrides({
      ...persisted,
      fontFamily: "sharp-sans",
      fontSizes: {},
      fontWeights: {},
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={
          <NextLink href="/">
            <Logo size="small" />
          </NextLink>
        }
        right={
          <div className="flex items-center gap-4">
            <NextLink
              href="/components"
              className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] hover:text-[var(--text-link)] transition-colors"
            >
              Components
            </NextLink>
            <NextLink
              href="/projects"
              className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] hover:text-[var(--text-link)] transition-colors"
            >
              Projects
            </NextLink>
          </div>
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            <Header title="Design System" />

            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                </TabsList>

                <TabsContent value="components">
                  <ComponentsTab
                    spacing={spacing}
                    setSpacing={setSpacing}
                    resetSpacing={handleSpacingReset}
                    spacingPushed={spacingPushed}
                    onSpacingPush={handleSpacingPush}
                    onSpacingReset={handleSpacingReset}
                  />
                </TabsContent>

                <TabsContent value="colors">
                  <ColorsTab
                    colorOverrides={colorOverrides}
                    setColorOverrides={setColorOverrides}
                    pushed={colorsPushed}
                    onPush={handleColorPush}
                    onReset={handleColorReset}
                  />
                </TabsContent>

                <TabsContent value="typography">
                  <TypographyTab
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    fontSizes={fontSizes}
                    setFontSizes={setFontSizes}
                    fontWeights={fontWeights}
                    setFontWeights={setFontWeights}
                    pushed={typoPushed}
                    onPush={handleTypoPush}
                    onReset={handleTypoReset}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </Section>
        </Container>
      </main>

      <Toaster />
    </div>
  );
}
