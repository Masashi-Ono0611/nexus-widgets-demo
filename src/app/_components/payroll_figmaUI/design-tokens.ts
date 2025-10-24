// Design tokens for consistent typography across payroll_figmaUI
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

// Color tokens for consistent color usage (3 gray patterns)
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

  // Status colors
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',

  // Interactive states
  hover: 'hover:bg-gray-50',
  focus: 'focus:ring-gray-200',

  // Mode selection colors
  modeActive: 'bg-blue-100 border-2 border-blue-500 text-blue-600 shadow-md', // Immediate mode active
  modeInactive: 'bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300', // Mode inactive
  modeRecurringActive: 'bg-purple-100 border-2 border-purple-500 text-purple-600 shadow-md', // Recurring mode active
} as const;

export type FontSizeKey = keyof typeof FONT_SIZES;
export type FontWeightKey = keyof typeof FONT_WEIGHTS;
export type ColorKey = keyof typeof COLORS;
