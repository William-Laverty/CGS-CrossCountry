/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cgs: {
          blue: {
            light: '#5EAAE0',
            DEFAULT: '#1176BC',
            dark: '#0A4B76',
          },
          orange: {
            light: '#FFB266',
            DEFAULT: '#FF9326',
            dark: '#E67300',
          },
          white: '#FFFFFF',
          navy: '#132F53',
        },
      },
    },
  },
  plugins: [],
};
