/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF2F4',
          100: '#FBE8EB',
          200: '#F5C5CC',
          300: '#ECA3AF',
          400: '#DD6277',
          500: '#B8203E',
          600: '#9E1532',
          700: '#800020', // Royal Burgundy Maroon (Signature)
          800: '#64051B',
          900: '#4A0815',
          950: '#2C030B',
        },
        gold: {
          50: '#FDFBF4',
          100: '#FAF4E2',
          200: '#F3E5BC',
          300: '#EBD593',
          400: '#DFC265',
          500: '#D4AF37', // Antique Zari Gold
          600: '#B99326',
          700: '#95741B',
          800: '#755819',
          900: '#5A4317',
          950: '#342609',
        },
        cream: {
          50: '#FCFBF8',
          100: '#FAF7F2', // Soft Silk Cream
          200: '#F4ECE1',
          300: '#EBDDCF',
          400: '#DEC9B4',
          500: '#CEB299',
          600: '#B5967C',
          700: '#937862',
          800: '#6B5748',
          900: '#473930',
        },
        silk: {
          emerald: '#135E48',
          ruby: '#9B111E',
          sapphire: '#0F2537',
          mustard: '#DE9B27',
          plum: '#581845',
          teal: '#1A535C',
          coral: '#D9534F',
          rani: '#D10068',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'silk': '0 4px 20px -2px rgba(128, 0, 32, 0.08), 0 2px 6px -1px rgba(212, 175, 55, 0.06)',
        'silk-lg': '0 10px 30px -4px rgba(128, 0, 32, 0.12), 0 4px 12px -2px rgba(212, 175, 55, 0.1)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'maroon-glow': '0 0 25px rgba(128, 0, 32, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'silk-pattern': "radial-gradient(#D4AF37 0.75px, transparent 0.75px), radial-gradient(#D4AF37 0.75px, #FAF7F2 0.75px)",
      }
    },
  },
  plugins: [],
}
