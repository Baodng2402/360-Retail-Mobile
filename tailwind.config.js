/** @type {import('tailwindcss').Config} */
module.exports = {
  // Important: include App.tsx in root!
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#19D6C8',
          foreground: '#FFFFFF',
          50: '#E6FAF8',
          100: '#B3F0EB',
          200: '#80E6DE',
          300: '#4DDCD1',
          400: '#26D4C7',
          500: '#19D6C8',
          600: '#14ADA3',
          700: '#0F847D',
          800: '#0A5B56',
          900: '#053230',
        },
        secondary: {
          DEFAULT: '#FF7B21',
          foreground: '#FFFFFF',
          50: '#FFF3EB',
          100: '#FFE0CC',
          200: '#FFCDAD',
          300: '#FFBA8E',
          400: '#FFA76F',
          500: '#FF7B21',
          600: '#E66B1A',
          700: '#CC5B13',
          800: '#B34B0C',
          900: '#993B05',
        },
        background: '#FFFFFF',
        foreground: '#1A1A1A',
        muted: {
          DEFAULT: '#F4F4F5',
          foreground: '#71717A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
        border: '#E4E4E7',
        input: '#E4E4E7',
        ring: '#19D6C8',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
