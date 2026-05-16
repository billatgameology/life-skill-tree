/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'system-ui', 'serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // PoE 2 dark palette
        void: '#08090F',
        surface: '#0D0E17',
        'surface-raised': '#151621',
        'surface-high': '#1C1D2B',
        ink: '#C8C6D2',
        'ink-muted': '#7A7887',
        'ink-dim': '#4A4858',
        // Skill branch colors (subtle, desaturated)
        creative: '#C4715E',
        problem: '#5A9B9B',
        social: '#B8964A',
        nature: '#5B9B6B',
        body: '#B0608A',
        everyday: '#5A8ABF',
        // Glows — 'glow-gold' is the themeable accent (see ThemeContext)
        'glow-gold': 'rgb(var(--accent-rgb) / <alpha-value>)',
        'glow-green': '#5B9B6B',
        // shadcn vars
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'nav': '0 8px 32px rgba(0,0,0,0.4)',
        'panel': '-4px 0 32px rgba(0,0,0,0.5)',
        'glow': '0 0 20px rgba(212,175,55,0.3)',
        'glow-green': '0 0 20px rgba(91,155,107,0.4)',
        'node-glow': '0 0 10px rgba(200,198,210,0.3)',
        'node-active': '0 0 14px rgba(212,175,55,0.5)',
        'node-completed': '0 0 14px rgba(91,155,107,0.5)',
      },
      keyframes: {
        "pulse-node": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        "dash-flow": {
          "0%": { strokeDashoffset: "12" },
          "100%": { strokeDashoffset: "0" },
        },
        "dash": {
          to: { strokeDashoffset: "-12" },
        },
        "glow-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 4px rgba(212,175,55,0.3))" },
          "50%": { filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))" },
        },
      },
      animation: {
        "pulse-node": "pulse-node 3s ease-in-out infinite",
        "dash-flow": "dash-flow 3s linear infinite",
        "dash": "dash 3s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
