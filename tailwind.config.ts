import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        border: "color-mix(in srgb, var(--app-border) calc(<alpha-value> * 100%), transparent)",
        input: "color-mix(in srgb, var(--app-input) calc(<alpha-value> * 100%), transparent)",
        ring: "color-mix(in srgb, var(--app-ring) calc(<alpha-value> * 100%), transparent)",
        background: "color-mix(in srgb, var(--app-background) calc(<alpha-value> * 100%), transparent)",
        foreground: "color-mix(in srgb, var(--app-foreground) calc(<alpha-value> * 100%), transparent)",
        primary: {
          DEFAULT: "color-mix(in srgb, var(--app-primary) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-primary-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        secondary: {
          DEFAULT: "color-mix(in srgb, var(--app-secondary) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-secondary-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        destructive: {
          DEFAULT: "color-mix(in srgb, var(--app-destructive) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-destructive-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        muted: {
          DEFAULT: "color-mix(in srgb, var(--app-muted) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-muted-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        accent: {
          DEFAULT: "color-mix(in srgb, var(--app-accent) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-accent-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        popover: {
          DEFAULT: "color-mix(in srgb, var(--app-popover) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-popover-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        card: {
          DEFAULT: "color-mix(in srgb, var(--app-card) calc(<alpha-value> * 100%), transparent)",
          foreground: "color-mix(in srgb, var(--app-card-foreground) calc(<alpha-value> * 100%), transparent)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
