/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B0000',
        secondary: '#D4AF37',
        accent: '#FFF8E7',
        bgLight: '#FAFAFA',
        bgDark: '#111111',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 8px 30px rgba(212,175,55,0.35)',
        premium: '0 20px 60px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #FFF8E7 50%, #D4AF37 100%)',
        'royal-gradient': 'linear-gradient(135deg, #8B0000 0%, #5c0000 100%)',
      },
    },
  },
  plugins: [],
};
