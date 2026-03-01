/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary — Teal
        primary: {
          DEFAULT: '#26C6DA',
          dark: '#00ACC1',
          light: '#E0F7FA',
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        },
        // Accent — Orange CTA
        accent: {
          DEFAULT: '#FF7043',
          dark: '#E64A19',
          light: '#FBE9E7',
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
