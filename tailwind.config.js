/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary — Teal (Synced from web)
        primary: {
          DEFAULT: '#19D6C8',
          dark: '#0FA297',
          light: '#E0FAFA',
          50: '#F0FCFC',
          100: '#E0FAFA',
          200: '#BEF5F2',
          300: '#9DEFEE',
          400: '#7BEAEB',
          500: '#5AE4E8',
          600: '#38DFE4',
          700: '#19D6C8',
          800: '#0FA297',
          900: '#0B7A72',
        },
        // Accent — Orange CTA (Synced from web)
        accent: {
          DEFAULT: '#FF7B21',
          dark: '#D45D0F',
          light: '#FFE8DB',
        },
        // Semantic
        success: { DEFAULT: '#4CAF50', light: '#E8F5E9' },
        warning: { DEFAULT: '#FFA726', light: '#FFF3E0' },
        error: { DEFAULT: '#EF5350', light: '#FFEBEE' },
        info: { DEFAULT: '#42A5F5', light: '#E3F2FD' },
        // Surface & Background
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        overlay: 'rgba(0,0,0,0.5)',
        // Text
        foreground: '#1E293B',
        'text-secondary': '#475569',
        muted: { DEFAULT: '#94A3B8', foreground: '#94A3B8' },
        'text-light': '#CBD5E1',
        // Borders
        border: '#E2E8F0',
        divider: '#F1F5F9',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
