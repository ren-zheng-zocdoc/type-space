export interface ComponentProperty {
  name: string;
  type: "select" | "boolean" | "text";
  label: string;
  options?: string[];
  defaultValue: string | boolean;
}

export interface ComponentVariant {
  id: string;
  name: string;
  description?: string;
}

export interface ComponentEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  variants: ComponentVariant[];
  properties: ComponentProperty[];
}

const categoryMap: Record<string, string> = {
  accordion: "Layout",
  avatar: "Display",
  badge: "Display",
  button: "Navigation",
  checkbox: "Forms",
  dialog: "Overlay",
  drawer: "Overlay",
  flag: "Feedback",
  icon: "Display",
  input: "Forms",
  link: "Navigation",
  logo: "Display",
  header: "Layout",
  nav: "Layout",
  progress: "Feedback",
  popover: "Overlay",
  pagination: "Navigation",
  radio: "Forms",
  "radio-cards": "Forms",
  "radio-group": "Forms",
  section: "Layout",
  select: "Forms",
  switch: "Forms",
  table: "Display",
  tabs: "Navigation",
  textarea: "Forms",
  toast: "Feedback",
  tooltip: "Overlay",
  map: "Display",
  "times-grid": "Display",
  "times-grid-empty": "Display",
};

export const components: ComponentEntry[] = [
  {
    id: "accordion",
    name: "Accordion",
    description: "A vertically stacked set of interactive headings that each reveal an associated section of content.",
    category: "Layout",
    variants: [],
    properties: [
      { name: "type", type: "select", label: "Type", options: ["single", "multiple"], defaultValue: "single" },
    ],
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "Circular avatar component for displaying user profile images with fallback support.",
    category: "Display",
    variants: [
      { id: "default", name: "Default", description: "Avatar with image" },
      { id: "initials", name: "Initials", description: "Avatar with initials when no image is available" },
    ],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["32", "40", "56", "72", "96", "120", "144"], defaultValue: "32" },
    ],
  },
  {
    id: "badge",
    name: "Badge",
    description: "Status tag component for displaying labels, states, and contextual information.",
    category: "Display",
    variants: [
      { id: "default", name: "Default", description: "Text-only badge" },
      { id: "withIcon", name: "With Icon", description: "Badge with variant-specific icon" },
      { id: "withTooltip", name: "With Tooltip", description: "Badge with info tooltip on hover" },
    ],
    properties: [
      { name: "variant", type: "select", label: "Type", options: ["yellow-dark", "yellow-light", "callout", "info", "positive", "negative", "charcoal"], defaultValue: "yellow-dark" },
    ],
  },
  {
    id: "button",
    name: "Button",
    description: "Interactive button component with multiple variants and sizes.",
    category: "Navigation",
    variants: [
      { id: "default", name: "Default", description: "Standard button styles" },
      { id: "withIcon", name: "With Icon", description: "Button with leading icon" },
      { id: "icon", name: "Icon", description: "Icon-only button for actions and controls" },
      { id: "toggle", name: "Toggle", description: "Pill-shaped toggle button with optional label" },
    ],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["primary", "secondary", "tertiary", "ghost", "destructive"], defaultValue: "primary" },
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "theme", type: "select", label: "Theme", options: ["light", "dark"], defaultValue: "light" },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
      { name: "showChevron", type: "boolean", label: "Show Chevron", defaultValue: false },
      { name: "isLoading", type: "boolean", label: "Loading", defaultValue: false },
    ],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    description: "Toggle selection control for boolean values.",
    category: "Forms",
    variants: [
      { id: "default", name: "Default", description: "Standalone checkbox without a label" },
      { id: "withLabel", name: "With Label", description: "Checkbox with label text" },
      { id: "group", name: "Group", description: "Multiple checkboxes for multi-select" },
      { id: "hierarchical", name: "Hierarchical", description: "Parent checkbox controlling child checkboxes" },
    ],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "dialog",
    name: "Dialog",
    description: "Modal dialog for focused interactions.",
    category: "Overlay",
    variants: [{ id: "default", name: "Default", description: "Standard dialog" }],
    properties: [{ name: "showLeftLink", type: "boolean", label: "Left Link", defaultValue: false }],
  },
  {
    id: "drawer",
    name: "Drawer",
    description: "Slide-out panel for secondary content, forms, or navigation. Slides in from the right.",
    category: "Overlay",
    variants: [{ id: "default", name: "Default", description: "Slides in from the right" }],
    properties: [
      { name: "showCloseButton", type: "boolean", label: "Close Button", defaultValue: true },
      { name: "showLeftLink", type: "boolean", label: "Left Link", defaultValue: false },
    ],
  },
  {
    id: "flag",
    name: "Flag",
    description: "Contextual feedback banner for success, error, info, and status notifications with optional actions.",
    category: "Feedback",
    variants: [],
    properties: [
      { name: "color", type: "select", label: "Color", options: ["greige", "yellow", "blue", "red", "green", "white"], defaultValue: "green" },
      { name: "showTitle", type: "boolean", label: "Title", defaultValue: true },
      { name: "leadingElement", type: "select", label: "Leading Element", options: ["none", "icon", "badge"], defaultValue: "icon" },
      { name: "action", type: "select", label: "Action", options: ["none", "button", "close"], defaultValue: "button" },
    ],
  },
  {
    id: "icon",
    name: "Icon",
    description: "Material Symbols icon component with variable font settings for optimal rendering at each size.",
    category: "Display",
    variants: [{ id: "default", name: "Default", description: "Standard icon display" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["16", "20", "24", "40"], defaultValue: "24" },
      { name: "filled", type: "boolean", label: "Filled", defaultValue: false },
    ],
  },
  {
    id: "input",
    name: "Input",
    description: "Text input field with optional label, helper text, and validation states.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Standard text input" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "state", type: "select", label: "State", options: ["default", "error"], defaultValue: "default" },
      { name: "required", type: "boolean", label: "Required", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "link",
    name: "Link",
    description: "Inline text link for navigation within content.",
    category: "Navigation",
    variants: [{ id: "default", name: "Default", description: "Standard inline link" }],
    properties: [{ name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" }],
  },
  {
    id: "logo",
    name: "Logo",
    description: "Brand logo component available as full wordmark or icon-only variants at multiple sizes.",
    category: "Display",
    variants: [],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["wordmark", "icon"], defaultValue: "wordmark" },
      { name: "size", type: "select", label: "Size", options: ["xsmall", "small", "medium", "large"], defaultValue: "medium" },
    ],
  },
  {
    id: "header",
    name: "Page Header",
    description: "Page header component with title, optional subbody, and right drop zone for actions.",
    category: "Layout",
    variants: [
      { id: "default", name: "Default", description: "Simple page header with just a title" },
      { id: "subbody", name: "Subbody", description: "Page header with supporting description text" },
      { id: "actions", name: "Actions", description: "Page header with action buttons on the right" },
    ],
    properties: [],
  },
  {
    id: "nav",
    name: "Nav",
    description: "Navigation bar component with left, center, and right drop zones for logos, search, buttons, and avatars.",
    category: "Layout",
    variants: [
      { id: "logo-with-avatar", name: "Logo with Avatar", description: "Navigation bar with logo and user avatar" },
      { id: "logo-with-actions", name: "Logo with Actions", description: "Navigation with logo and action buttons" },
      { id: "actions", name: "Actions", description: "Navigation with action buttons on both sides" },
    ],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["default", "transparent"], defaultValue: "default" },
    ],
  },
  {
    id: "progress",
    name: "Progress",
    description: "Progress bar component for showing completion status of a task or process.",
    category: "Feedback",
    variants: [{ id: "default", name: "Default", description: "Standard progress bar" }],
    properties: [
      { name: "variant", type: "select", label: "Variant", options: ["default", "stepped"], defaultValue: "default" },
      { name: "size", type: "select", label: "Size", options: ["small", "default"], defaultValue: "default" },
    ],
  },
  {
    id: "popover",
    name: "Popover",
    description: "Floating content panel that appears next to a trigger element for additional context or actions.",
    category: "Overlay",
    variants: [{ id: "default", name: "Default", description: "Standard popover with content" }],
    properties: [
      { name: "side", type: "select", label: "Side", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
      { name: "align", type: "select", label: "Align", options: ["start", "center", "end"], defaultValue: "center" },
    ],
  },
  {
    id: "pagination",
    name: "Pagination",
    description: "Navigation component for paginated content with page numbers and previous/next controls.",
    category: "Navigation",
    variants: [{ id: "default", name: "Default", description: "Standard pagination with page numbers and navigation" }],
    properties: [{ name: "showNavigation", type: "boolean", label: "Show Navigation", defaultValue: true }],
  },
  {
    id: "radio",
    name: "Radio",
    description: "A single radio button for simple binary choices within a group context.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Single radio button with label" }],
    properties: [
      { name: "showSupportingText", type: "boolean", label: "Supporting Text", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "radio-cards",
    name: "Radio Cards",
    description: "Card-based radio selection for more prominent choices.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Wide cards that stack vertically" }],
    properties: [
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "radio-group",
    name: "Radio Group",
    description: "Single selection from multiple options in a list.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Select one option from a list" }],
    properties: [
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "section",
    name: "Section",
    description: "Layout primitive for vertical page sections with consistent spacing.",
    category: "Layout",
    variants: [{ id: "default", name: "Default", description: "Section with configurable vertical padding" }],
    properties: [{ name: "size", type: "select", label: "Size", options: ["1", "2", "3", "4"], defaultValue: "3" }],
  },
  {
    id: "select",
    name: "Select",
    description: "Dropdown selection component with button trigger.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Standard select dropdown" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "hasError", type: "boolean", label: "Error State", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "switch",
    name: "Switch",
    description: "Toggle switch for binary on/off settings.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Standard toggle switch" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "table",
    name: "Table",
    description: "Data table component powered by TanStack Table for displaying tabular data with sorting, filtering, and pagination.",
    category: "Display",
    variants: [
      { id: "default", name: "Default", description: "Basic data table with header and rows" },
      { id: "withTooltips", name: "With Tooltips", description: "Table headers with info tooltips" },
      { id: "withSelection", name: "With Selection", description: "Checkbox column for selecting rows" },
      { id: "withActions", name: "With Actions", description: "Overflow menu button for row actions" },
      { id: "withEditable", name: "With Editable Cells", description: "Inline editable cells with popover editor" },
      { id: "withPagination", name: "With Pagination", description: "Table with pagination controls" },
    ],
    properties: [],
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "Tabbed navigation component for organizing content into sections.",
    category: "Navigation",
    variants: [{ id: "default", name: "Default", description: "Standard horizontal tabs" }],
    properties: [
      { name: "variant", type: "select", label: "Style", options: ["underline", "segmented"], defaultValue: "underline" },
      { name: "fullWidth", type: "boolean", label: "Full Width", defaultValue: false },
    ],
  },
  {
    id: "textarea",
    name: "Textarea",
    description: "Multi-line text input field for longer form content.",
    category: "Forms",
    variants: [{ id: "default", name: "Default", description: "Standard textarea" }],
    properties: [
      { name: "size", type: "select", label: "Size", options: ["default", "small"], defaultValue: "default" },
      { name: "state", type: "select", label: "State", options: ["default", "error"], defaultValue: "default" },
      { name: "required", type: "boolean", label: "Required", defaultValue: false },
      { name: "disabled", type: "boolean", label: "Disabled", defaultValue: false },
    ],
  },
  {
    id: "toast",
    name: "Toast",
    description: "Non-blocking notification that provides feedback to users. Appears from the top of the screen.",
    category: "Feedback",
    variants: [{ id: "default", name: "Default", description: "Toast notification" }],
    properties: [
      { name: "type", type: "select", label: "Type", options: ["default", "error"], defaultValue: "default" },
      { name: "showAction", type: "boolean", label: "Action Link", defaultValue: true },
      { name: "autoDismiss", type: "boolean", label: "Auto Dismiss (2s)", defaultValue: false },
    ],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description: "Contextual popup that displays additional information on hover or focus.",
    category: "Overlay",
    variants: [{ id: "default", name: "Default", description: "Standard tooltip with text content" }],
    properties: [],
  },
  {
    id: "map",
    name: "Map",
    description: "Google Maps component with Vibezz-branded styling. Displays locations with custom theme colors.",
    category: "Display",
    variants: [{ id: "default", name: "Default", description: "Interactive map with branded styling" }],
    properties: [
      { name: "zoom", type: "select", label: "Zoom Level", options: ["10", "12", "14", "16"], defaultValue: "12" },
      { name: "showControls", type: "boolean", label: "Show Controls", defaultValue: true },
      { name: "showMarker", type: "boolean", label: "Show Marker", defaultValue: true },
    ],
  },
  {
    id: "times-grid",
    name: "Times Grid",
    description: "Responsive availability grid for displaying provider appointment availability.",
    category: "Display",
    variants: [
      { id: "day-grid-default", name: "Day Grid", description: "7-column grid showing available dates by day" },
      { id: "day-grid-mobile", name: "Day Grid Mobile", description: "Horizontal scroll layout for mobile" },
      { id: "hour-grid-default", name: "Hour Grid", description: "Hourly time slots with date header" },
      { id: "hour-grid-mobile", name: "Hour Grid Mobile", description: "Horizontal scroll for hourly slots" },
    ],
    properties: [],
  },
  {
    id: "times-grid-empty",
    name: "Times Grid Empty",
    description: "Empty state variants for the Times Grid when no availability exists.",
    category: "Display",
    variants: [
      { id: "next-availability", name: "Next Availability", description: "CTA button showing next available date" },
      { id: "no-availability", name: "No Availability", description: "Empty state message when no availability" },
      { id: "notify-me", name: "Notify Me", description: "Empty state with notify me button" },
    ],
    properties: [],
  },
];

export const categories = ["All", "Forms", "Layout", "Display", "Feedback", "Overlay", "Navigation"] as const;
export type Category = (typeof categories)[number];
