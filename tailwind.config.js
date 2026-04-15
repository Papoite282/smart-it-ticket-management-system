/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Georgia', '"Times New Roman"', 'serif'],
      },
      colors: {
        cream: {
          50: '#f4eedc',
          100: '#eee6d1',
          200: '#ddd2b8',
          300: '#c8b999',
          400: '#b09c76',
          500: '#927c55',
          600: '#715f42',
          700: '#544733',
          800: '#383027',
          900: '#241f1a',
        },
        coffee: {
          50: '#f5efe2',
          100: '#e8dcc6',
          200: '#d1bea0',
          300: '#ad9270',
          400: '#85684d',
          500: '#634b38',
          600: '#4e3b2f',
          700: '#3f3028',
          800: '#30251f',
          900: '#251d19',
          950: '#18120f',
        },
        graphite: {
          50: '#f5f4ef',
          100: '#dcddd6',
          200: '#b8bbb3',
          300: '#8f948e',
          400: '#6b7170',
          500: '#555c60',
          600: '#464d53',
          700: '#3b4148',
          800: '#30363d',
          900: '#272d34',
          950: '#1d2228',
        },
        brand: {
          50: '#f6efdd',
          100: '#e9dcc0',
          200: '#d7c397',
          300: '#bea16a',
          400: '#9f7b45',
          500: '#806037',
          600: '#63492e',
          700: '#4d3928',
          800: '#362a21',
          900: '#241d18',
        }
      },
      boxShadow: {
        card: '0 24px 60px -34px rgba(39, 45, 52, 0.38)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(80, 68, 51, 0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(80, 68, 51, 0.075) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
