module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f7fa',
          100: '#e6eef5',
          200: '#d2e2ee',
          300: '#b0cee0',
          400: '#84b2cf',
          500: '#5e96bd',
          600: '#4a7ca3',
          700: '#3f6785',
          800: '#365571',
          900: '#304760',
        },
        secondary: {
          50: '#f5f8f7',
          100: '#e7f0ef',
          200: '#d1e3e0',
          300: '#accdc8',
          400: '#7db0a7',
          500: '#5a9189',
          600: '#4b7a74',
          700: '#406661',
          800: '#385451',
          900: '#314745',
        },
      },
    },
  },
  plugins: [],
} 