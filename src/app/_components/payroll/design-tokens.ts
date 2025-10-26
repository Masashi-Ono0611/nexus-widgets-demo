// Design tokens for consistent typography across payroll
export const FONT_SIZES = {
  // Page Headers
  pageTitle: 'text-5xl md:text-6xl', // Main page title
  pageSubtitle: 'text-lg', // Page subtitle

  // Section Headers
  sectionHeading: 'text-lg font-semibold', // Card/section titles
  cardTitle: 'text-lg font-semibold', // Card titles

  // Body Text
  bodyLarge: 'text-base', // Main body text
  bodyMedium: 'text-sm', // Secondary text, labels
  bodySmall: 'text-xs', // Helper text, descriptions

  // Interactive Elements
  buttonLarge: 'text-xl', // Large buttons (CTA)
  buttonMedium: 'text-sm', // Standard buttons
  buttonSmall: 'text-xs', // Small buttons

  // Status & Info
  infoPill: 'text-sm', // Info pills in header
  badge: 'text-xs', // Badges and small indicators
  error: 'text-sm', // Error messages

  // Form Elements
  label: 'text-sm', // Form labels
  input: 'text-sm', // Input text
  help: 'text-xs', // Help text under inputs

  // Modal/Dialog
  modalTitle: 'text-lg font-semibold', // Dialog titles
  modalDescription: 'text-sm', // Dialog descriptions
} as const;

// Font weight tokens for consistent text styling
export const FONT_WEIGHTS = {
  // Headings and Titles
  pageTitle: 'font-bold', // Main page titles
  sectionHeading: 'font-semibold', // Section and card titles
  modalTitle: 'font-semibold', // Dialog titles
  configTitle: 'font-semibold', // Configuration names

  // Body Text
  bodyRegular: 'font-normal', // Regular body text
  label: 'font-medium', // Form labels and UI labels
  emphasis: 'font-medium', // Emphasized text, error messages

  // Interactive Elements
  button: 'font-medium', // Button text
  link: 'font-medium', // Link text

  // Status & Info
  infoValue: 'font-semibold', // Important values in info displays
  badge: 'font-medium', // Badge text
} as const;

// Color tokens for consistent color usage
export const COLORS = {
  // Primary text colors
  textPrimary: 'text-gray-900', // Main headings and important text
  textSecondary: 'text-gray-600', // Body text and descriptions
  textTertiary: 'text-gray-500', // Helper text and labels

  // Background colors
  backgroundPrimary: 'bg-white', // Main backgrounds
  backgroundSecondary: 'bg-gray-50', // Secondary backgrounds (cards, sections)
  backgroundAccent: 'bg-gray-100', // Accent backgrounds

  // Border colors
  borderPrimary: 'border-gray-200', // Primary borders
  borderSecondary: 'border-gray-300', // Secondary borders
  borderAccent: 'border-gray-400', // Accent borders

  // Brand colors - Application identity colors
  brand: {
    // Main recipient color (buttons, badges)
    recipientPrimary: {
      text: 'text-white',
      background: 'bg-[#1565C0]',
      border: 'border-[#0D47A1]',
      hover: 'hover:bg-[#1976D2] hover:border-[#1565C0]',
      active: 'bg-[#1976D2] border-[#1565C0]',
    },
    // Light version for info cards
    recipientPrimaryLight: {
      text: 'text-blue-600',
      background: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100 hover:border-blue-300',
      active: 'bg-blue-100 border-blue-300',
    },
    // Important version for buttons with !important
    recipientPrimaryImportant: {
      text: '!text-white',
      background: '!bg-[#1565C0]',
      border: '!border-[#0D47A1]',
      hover: '!hover:bg-[#1976D2] !hover:border-[#1565C0]',
      active: '!bg-[#1976D2] !border-[#1565C0]',
      focus: '!focus:ring-[#42A5F5]',
    },
    // Icon colors
    iconPrimary: 'text-[#1565C0]', // Recipient 1 blue for icons
  },

  // Status colors
  status: {
    info: {
      text: 'text-blue-600',
      background: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100 hover:border-blue-300',
    },
    error: {
      text: 'text-red-600',
      background: 'bg-red-50',
      border: 'border-red-200',
      hover: 'hover:bg-red-100 hover:border-red-300',
    },
  },

  // Interactive states
  interactiveImportant: {
    hover: '!hover:bg-gray-50',
    focus: '!focus:ring-gray-200',
    active: '!active:bg-gray-100',
    disabled: '!opacity-50 !cursor-not-allowed',
  },

  // Mode selection colors
  modeActive: 'bg-[#E3F2FD] border-2 border-[#1565C0] text-[#1565C0] shadow-md', // Active mode with Recipient 1 color
  modeRecurringActive: 'bg-[#E3F2FD] border-2 border-[#1565C0] text-[#1565C0] shadow-md', // Recurring mode active with Recipient 1 color

  // UI components
  accordion: {
    item: 'border border-gray-200 rounded-lg px-6',
    trigger: 'hover:no-underline py-6',
    content: 'pt-0 pb-6',
    container: 'w-full space-y-2',
  },

  // Grid layouts
  grid: {
    strategies: 'grid-cols-1 md:grid-cols-2 gap-1',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin text-blue-600',
    spinnerSize: 'h-8 w-8',
    spinnerContainer: 'flex items-center justify-center py-8',
  },
} as const;

// Helper functions for strategy shades based on recipient color
export function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(Math.max(0, Math.min(255, Math.round(r))))}${toHex(Math.max(0, Math.min(255, Math.round(g))))}${toHex(Math.max(0, Math.min(255, Math.round(b))))}`;
}

export function lighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => c + (255 - c) * amount;
  return rgbToHex(mix(r), mix(g), mix(b));
}

export function getStrategyShade(baseHex: string, strategyIndex: number) {
  const factors = [0.15, 0.35, 0.55, 0.75];
  const idx = Math.max(0, Math.min(factors.length - 1, strategyIndex));
  return lighten(baseHex, factors[idx]);
}

export type FontSizeKey = keyof typeof FONT_SIZES;
export type FontWeightKey = keyof typeof FONT_WEIGHTS;
export type ColorKey = keyof typeof COLORS;
