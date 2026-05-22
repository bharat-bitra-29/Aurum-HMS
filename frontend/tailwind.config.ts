import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ec',
          100: '#f9edca',
          200: '#f3d891',
          300: '#ecc05a',
          400: '#e5a82e',
          500: '#c8891a',
          600: '#a06a13',
          700: '#7a4e12',
          800: '#653f15',
          900: '#563516',
        },
        obsidian: {
          50:  '#f5f5f0',
          100: '#e8e8df',
          200: '#d2d2c4',
          300: '#b4b49a',
          400: '#969671',
          500: '#7d7d59',
          600: '#616148',
          700: '#4d4d3b',
          800: '#414135',
          900: '#38382e',
          950: '#1a1a14',
        },
        noir: {
          50:  '#f8f8f8',
          100: '#f0f0f0',
          200: '#e4e4e4',
          300: '#d1d1d1',
          400: '#b4b4b4',
          500: '#9a9a9a',
          600: '#818181',
          700: '#6a6a6a',
          800: '#5a5a5a',
          900: '#4e4e4e',
          950: '#0a0a0a',
        },
        'light-bg': '#f8f8f6',
        'light-card': '#ffffff',
        'light-text': '#1a1a14',
        'light-text-secondary': '#6a6a6a',
        'light-border': '#e4e4e4',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(135deg, #c8891a 0%, #e5a82e 40%, #f3d891 60%, #c8891a 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', ':not(.dark) &')
    }),
  ],
} satisfies Config
