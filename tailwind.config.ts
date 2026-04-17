/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol'
        ],
      },
      colors: {
        primary: {
          50: '#f3f9e9',
          100: '#e7f4d3',
          200: '#cfe9a7',
          300: '#b7de7b',
          400: '#9fd34f',
          500: '#86C232', // base color
          600: '#6c9c28',
          700: '#51751e',
          800: '#364e14',
          900: '#1b270a'
        },
        secondary: {
          50: '#e9eaea',
          100: '#d3d5d5',
          200: '#a8abab',
          300: '#7c8181',
          400: '#515757',
          500: '#222629', // base color
          600: '#1b1e20',
          700: '#141617',
          800: '#0d0f0f',
          900: '#070708'
        },
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed', // base
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [],
}
