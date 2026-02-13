/**
 * UnityLearn Color System
 * 
 * Design tokens for consistent theming across the application.
 * Supports both light and dark modes via CSS variables.
 */

// Primary Colors
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6', // Main primary color
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const;

// Difficulty Level Colors
export const difficulty = {
  beginner: {
    name: 'Beginner',
    color: '#22c55e', // Green
    bg: '#dcfce7',
    border: '#86efac',
    dark: {
      color: '#4ade80',
      bg: '#14532d',
      border: '#166534',
    },
  },
  easy: {
    name: 'Easy',
    color: '#14b8a6', // Teal
    bg: '#ccfbf1',
    border: '#5eead4',
    dark: {
      color: '#2dd4bf',
      bg: '#134e4a',
      border: '#0f766e',
    },
  },
  normal: {
    name: 'Normal',
    color: '#3b82f6', // Blue
    bg: '#dbeafe',
    border: '#93c5fd',
    dark: {
      color: '#60a5fa',
      bg: '#1e3a8a',
      border: '#1d4ed8',
    },
  },
  hard: {
    name: 'Hard',
    color: '#f97316', // Orange
    bg: '#ffedd5',
    border: '#fdba74',
    dark: {
      color: '#fb923c',
      bg: '#7c2d12',
      border: '#9a3412',
    },
  },
  expert: {
    name: 'Expert',
    color: '#ef4444', // Red
    bg: '#fee2e2',
    border: '#fca5a5',
    dark: {
      color: '#f87171',
      bg: '#7f1d1d',
      border: '#991b1b',
    },
  },
} as const;

// Semantic Colors
export const semantic = {
  success: {
    light: '#22c55e',
    dark: '#4ade80',
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24',
  },
  error: {
    light: '#ef4444',
    dark: '#f87171',
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa',
  },
} as const;

// Dark Mode Palette (Slate-based)
export const dark = {
  background: '#0f172a',      // slate-900
  foreground: '#f8fafc',      // slate-50
  card: '#1e293b',            // slate-800
  cardForeground: '#f8fafc',  // slate-50
  popover: '#1e293b',         // slate-800
  popoverForeground: '#f8fafc', // slate-50
  muted: '#334155',           // slate-700
  mutedForeground: '#94a3b8', // slate-400
  accent: '#334155',          // slate-700
  accentForeground: '#f8fafc', // slate-50
  border: '#334155',          // slate-700
  input: '#334155',           // slate-700
  ring: '#60a5fa',            // blue-400
} as const;

// Light Mode Palette
export const light = {
  background: '#ffffff',
  foreground: '#0f172a',      // slate-900
  card: '#ffffff',
  cardForeground: '#0f172a',  // slate-900
  popover: '#ffffff',
  popoverForeground: '#0f172a', // slate-900
  muted: '#f1f5f9',           // slate-100
  mutedForeground: '#64748b', // slate-500
  accent: '#f1f5f9',          // slate-100
  accentForeground: '#0f172a', // slate-900
  border: '#e2e8f0',          // slate-200
  input: '#e2e8f0',           // slate-200
  ring: '#3b82f6',            // blue-500
} as const;

// Utility function to get difficulty color
export function getDifficultyColor(level: keyof typeof difficulty) {
  return difficulty[level];
}

// CSS Variable definitions for globals.css
export const cssVariables = {
  light: {
    '--background': light.background,
    '--foreground': light.foreground,
    '--card': light.card,
    '--card-foreground': light.cardForeground,
    '--popover': light.popover,
    '--popover-foreground': light.popoverForeground,
    '--primary': primary[500],
    '--primary-foreground': '#ffffff',
    '--secondary': light.muted,
    '--secondary-foreground': light.foreground,
    '--muted': light.muted,
    '--muted-foreground': light.mutedForeground,
    '--accent': light.accent,
    '--accent-foreground': light.accentForeground,
    '--destructive': semantic.error.light,
    '--destructive-foreground': '#ffffff',
    '--border': light.border,
    '--input': light.input,
    '--ring': light.ring,
    '--radius': '0.5rem',
    // Difficulty colors
    '--difficulty-beginner': difficulty.beginner.color,
    '--difficulty-easy': difficulty.easy.color,
    '--difficulty-normal': difficulty.normal.color,
    '--difficulty-hard': difficulty.hard.color,
    '--difficulty-expert': difficulty.expert.color,
  },
  dark: {
    '--background': dark.background,
    '--foreground': dark.foreground,
    '--card': dark.card,
    '--card-foreground': dark.cardForeground,
    '--popover': dark.popover,
    '--popover-foreground': dark.popoverForeground,
    '--primary': primary[400],
    '--primary-foreground': '#0f172a',
    '--secondary': dark.muted,
    '--secondary-foreground': dark.foreground,
    '--muted': dark.muted,
    '--muted-foreground': dark.mutedForeground,
    '--accent': dark.accent,
    '--accent-foreground': dark.accentForeground,
    '--destructive': semantic.error.dark,
    '--destructive-foreground': '#ffffff',
    '--border': dark.border,
    '--input': dark.input,
    '--ring': dark.ring,
    '--radius': '0.5rem',
    // Difficulty colors
    '--difficulty-beginner': difficulty.beginner.dark.color,
    '--difficulty-easy': difficulty.easy.dark.color,
    '--difficulty-normal': difficulty.normal.dark.color,
    '--difficulty-hard': difficulty.hard.dark.color,
    '--difficulty-expert': difficulty.expert.dark.color,
  },
} as const;

export type DifficultyLevel = keyof typeof difficulty;
