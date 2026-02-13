import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // Difficulty level colors
        difficulty: {
          beginner: {
            DEFAULT: "var(--difficulty-beginner)",
            light: "#22c55e",
            dark: "#4ade80",
          },
          easy: {
            DEFAULT: "var(--difficulty-easy)",
            light: "#14b8a6",
            dark: "#2dd4bf",
          },
          normal: {
            DEFAULT: "var(--difficulty-normal)",
            light: "#3b82f6",
            dark: "#60a5fa",
          },
          hard: {
            DEFAULT: "var(--difficulty-hard)",
            light: "#f97316",
            dark: "#fb923c",
          },
          expert: {
            DEFAULT: "var(--difficulty-expert)",
            light: "#ef4444",
            dark: "#f87171",
          },
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
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
      },
      fontSize: {
        // Display sizes
        "display-1": ["3rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "display-2": ["2.25rem", { lineHeight: "1.35", letterSpacing: "-0.02em" }],
        
        // Heading sizes - Requirements: h1(32px), h2(24px), h3(20px), h4(18px)
        "heading-1": ["2rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],      // 32px
        "heading-2": ["1.5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],    // 24px
        "heading-3": ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],   // 20px
        "heading-4": ["1.125rem", { lineHeight: "1.6", letterSpacing: "-0.02em" }],  // 18px
        
        // Body sizes - Requirements: large(18px), medium(16px), small(14px), caption(12px)
        "body-lg": ["1.125rem", { lineHeight: "1.8" }],   // 18px
        "body-base": ["1rem", { lineHeight: "1.75" }],    // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.7" }],   // 14px
        "caption": ["0.75rem", { lineHeight: "1.6", letterSpacing: "0.01em" }], // 12px
      },
      lineHeight: {
        // Korean optimized line heights (1.6-1.8)
        korean: "1.8",
        "korean-tight": "1.6",
        "korean-relaxed": "1.75",
        // Additional scale
        11: "2.75rem",
        12: "3rem",
      },
      letterSpacing: {
        // Korean optimized letter spacing
        "korean-heading": "-0.02em",
        "korean-body": "0",
        tighter: "-0.05em",
        tight: "-0.025em",
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
    },
  },
  plugins: [],
};

export default config;
