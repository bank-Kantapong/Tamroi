import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-thai)", "var(--font-prompt)", "sans-serif"],
        display: ["var(--font-prompt)", "var(--font-ibm-thai)", "sans-serif"],
      },
      colors: {
        /* CSS Variable Tokens mapped from globals.css */
        page: "var(--color-bg-page)",
        primary: "var(--color-brand-primary)",
        "brand-deep": "var(--color-brand-deep)",
        "brand-teal": "var(--color-brand-teal-light)",
        "brand-teal-dark": "var(--color-brand-teal-dark)",
        "border-subtle": "var(--color-border-subtle)",

        /* Tropical Jade Sunrise Palette */
        tropical: {
          jade: "var(--color-brand-primary)",
          aqua: "var(--color-accent-aqua)",
          peach: "var(--color-peach)",
          sun: "var(--color-sun-yellow)",
          sage: "var(--color-sage)",
        },
        brand: {
          50: "var(--color-bg-soft)",
          100: "var(--color-brand-tag-bg)",
          200: "var(--color-border-alt)",
          300: "#6ddae5",
          400: "var(--color-accent-aqua)",
          500: "var(--color-brand-cyan)",
          600: "var(--color-brand-primary)",
          700: "var(--color-brand-primary)",
          800: "var(--color-brand-primary-hover)",
          900: "var(--color-brand-deep)",
        },
        // Semantic Token Helpers
        sun: {
          yellow: "var(--color-sun-yellow)",
          light: "var(--color-sun-yellow-light)",
          bright: "var(--color-sun-yellow-bright)",
          cream: "var(--color-sun-cream)",
          lightest: "var(--color-sun-lightest)",
          text: "var(--color-sun-text)",
          dark: "var(--color-sun-text-dark)",
          amber: "var(--color-sun-amber)",
        },
        mint: {
          border: "var(--color-mint-border)",
          bg: "var(--color-mint-bg)",
          text: "var(--color-mint-text)",
          icon: "var(--color-mint-icon)",
        },
        coral: {
          border: "var(--color-coral-border)",
          bg: "var(--color-coral-bg)",
          text: "var(--color-coral-text)",
          icon: "var(--color-coral-icon)",
          accent: "var(--color-coral-accent)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
