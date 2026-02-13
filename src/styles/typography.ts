/**
 * Typography System for UnityLearn
 * 
 * Pretendard 기반 한국어 최적화 타이포그래피 시스템
 * - 한글 가독성을 고려한 line-height (1.6-1.8)
 * - 한글 자간 조정 (-0.02em ~ 0)
 * 
 * Requirements:
 * - Heading: h1(32px), h2(24px), h3(20px), h4(18px)
 * - Body: large(18px), medium(16px), small(14px), caption(12px)
 * - Letter-spacing: -0.02em for headings
 * - Korean-optimized line-height: 1.6-1.8
 */

// Font family with Pretendard as primary
export const fontFamily = {
  pretendard: [
    "var(--font-pretendard)",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
  mono: [
    "SF Mono",
    "Monaco",
    "Inconsolata",
    "Fira Code",
    "monospace",
  ],
} as const;

// Font weights
export const fontWeight = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const;

// Typography scale with Korean-optimized settings
// Requirements: h1(32px), h2(24px), h3(20px), h4(18px)
export const typography = {
  // Headings
  h1: {
    fontSize: "2rem", // 32px
    fontWeight: 700,
    lineHeight: 1.4, // Korean-optimized
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.5rem", // 24px
    fontWeight: 700,
    lineHeight: 1.5,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "1.25rem", // 20px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: "-0.02em",
  },
  h4: {
    fontSize: "1.125rem", // 18px
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: "-0.02em",
  },

  // Body text
  // Requirements: large(18px), medium(16px), small(14px), caption(12px)
  bodyLarge: {
    fontSize: "1.125rem", // 18px
    fontWeight: 400,
    lineHeight: 1.8, // Korean optimal reading
    letterSpacing: "0",
  },
  bodyMedium: {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: "0",
  },
  bodySmall: {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: "0",
  },

  // Caption
  caption: {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },

  // Special variants
  label: {
    fontSize: "0.875rem", // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: "0",
  },
  button: {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: "-0.01em",
  },
} as const;

// Utility helpers for common text patterns (Tailwind classes)
export const textStyles = {
  // Section titles
  sectionTitle: "text-3xl font-bold tracking-tight leading-tight",
  
  // Card titles
  cardTitle: "text-xl font-semibold tracking-tight leading-snug",
  
  // Primary content
  contentPrimary: "text-base leading-relaxed",
  
  // Secondary/Meta text
  contentSecondary: "text-sm leading-relaxed text-muted-foreground",
  
  // Navigation
  navLink: "text-base font-medium tracking-tight",
  
  // Interactive elements
  buttonText: "text-base font-semibold tracking-tight",
  
  // Code/Technical
  codeText: "text-sm font-mono leading-relaxed",
} as const;

// Line height tokens
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 1.75,
  korean: 1.8,
} as const;

// Letter spacing tokens
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
  koreanHeading: "-0.02em",
  koreanBody: "0",
} as const;

// Responsive font sizes for Tailwind config
// Format: [fontSize, { lineHeight, letterSpacing }]
export const fontSize = {
  // Display sizes
  "display-1": ["3rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
  "display-2": ["2.25rem", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
  
  // Heading sizes - matching requirements: h1(32px), h2(24px), h3(20px), h4(18px)
  "heading-1": ["2rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],      // 32px
  "heading-2": ["1.5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],    // 24px
  "heading-3": ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],   // 20px
  "heading-4": ["1.125rem", { lineHeight: "1.6", letterSpacing: "-0.02em" }],  // 18px
  
  // Body sizes - matching requirements: large(18px), medium(16px), small(14px), caption(12px)
  "body-lg": ["1.125rem", { lineHeight: "1.8" }],   // 18px
  "body-base": ["1rem", { lineHeight: "1.75" }],    // 16px
  "body-sm": ["0.875rem", { lineHeight: "1.7" }],   // 14px
  "caption": ["0.75rem", { lineHeight: "1.6", letterSpacing: "0.01em" }], // 12px
} as const;

export default {
  fontFamily,
  fontWeight,
  typography,
  textStyles,
  lineHeight,
  letterSpacing,
  fontSize,
};
