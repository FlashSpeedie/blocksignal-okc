import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          50: '#f0f5fa',
          100: '#dce3ef',
          200: '#bccadd',
          300: '#8fa3c2',
          400: '#657aa1',
          500: '#4a5d85',
          600: '#3d4a6e',
          700: '#333d59',
          800: '#2d344a',
          900: '#282e3f',
          950: '#1a1d2b',
        },
        accent: {
          50: '#fef7ee',
          100: '#fdedd5',
          200: '#fad9ab',
          300: '#f7bc74',
          400: '#f3973b',
          500: '#ef7d17',
          600: '#e0610d',
          700: '#ba4a0e',
          800: '#953d12',
          900: '#783413',
          950: '#401707',
        },
        status: {
          planning: '#3b82f6',
          active: '#22c55e',
          delayed: '#f59e0b',
          completed: '#10b981',
          cancelled: '#ef4444',
          unknown: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
};

export default config;