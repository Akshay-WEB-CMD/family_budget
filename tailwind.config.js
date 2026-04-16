/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#0f172a',
          'bg-deep': '#020617',
          card: '#1e293b',
          'card-hover': '#334155',
          accent: '#7c4dff',
          'accent-glow': 'rgba(124, 77, 255, 0.4)',
        }
      },
      backgroundImage: {
        'fintech-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
      borderRadius: {
        'premium': '18px',
      },
      animation: {
        'lift': 'lift 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        lift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
