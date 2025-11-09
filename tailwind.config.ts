
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // RealiMeali Brand Colors - Updated for Meal Planner
        navy: "#232D3F", // Dark navy for titles
        "navy-old": "#3D405B", // Legacy navy
        terracotta: "#E07A5F", 
        sage: "#48A97D", // Brand green
        "sage-light": "#81B29A", // Legacy sage
        "sage-muted": "#CFE7D9", // Muted green backgrounds
        butter: "#FEEA97", // Warm yellow
        "butter-old": "#F2CC8F", // Legacy butter
        cream: "#F4F1DE",
        "warm-salmon": "#fef7ef", // Universal app background
        "grey-light": "#9DA4AF", // Light grey for subtitles
        "red-action": "#E35B5B", // Action red
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      "slide-down": {
        from: { height: "0", opacity: "0" },
        to: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
      },
      "slide-up": {
        from: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
        to: { height: "0", opacity: "0" },
      },
        "badge-unlock": {
          "0%": { transform: "scale(0.8) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "hover-lift": {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-4px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-in-slow": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(10px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
      },
      animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "slide-down": "slide-down 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      "slide-up": "slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "badge-unlock": "badge-unlock 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "hover-lift": "hover-lift 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scale-in-slow": "scale-in-slow 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
