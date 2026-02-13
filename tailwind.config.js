/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        secondary: '#22C55E',
        'bg-dark': '#0F172A',
        'bg-light': '#F8FAFC',
        'card-dark': '#1E293B',
        'card-light': '#FFFFFF',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '24px',
      },
      fontFamily: {
        'inter-regular': ['Inter-Regular'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};
