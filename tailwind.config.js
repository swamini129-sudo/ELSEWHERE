/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F4F0E7',
          light: '#FAF7F2',
          dark: '#E7E1D4',
        },
        sage: {
          DEFAULT: '#A9B7A0',
          light: '#C4CFBE',
          dark: '#7D8E73',
          subtle: '#EEF2EC',
        },
        forest: {
          DEFAULT: '#24372F',
          deep: '#182520',
          surface: '#2E443B',
          light: '#3D594E',
        },
        charcoal: {
          DEFAULT: '#222524',
          deep: '#171918',
          muted: '#4A4F4D',
          light: '#6E7572',
        },
        rust: {
          DEFAULT: '#B4583A',
          hover: '#9E4B30',
          subtle: '#F6ECE8',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cinematic': '0 12px 36px -8px rgba(36, 55, 47, 0.12), 0 4px 12px rgba(36, 55, 47, 0.06)',
        'elevated': '0 20px 48px -12px rgba(24, 37, 32, 0.25)',
      }
    },
  },
  plugins: [],
}
