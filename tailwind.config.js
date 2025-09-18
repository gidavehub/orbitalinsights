module.exports = {
  theme: {
    extend: {
      keyframes: {
        aurora: {
          '0%': { transform: 'translateX(-10%) translateY(-10%) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translateX(10%) translateY(10%) scale(1.1)', opacity: '0.6' },
          '100%': { transform: 'translateX(-10%) translateY(5%) scale(1.05)', opacity: '0.45' },
        },
      },
      animation: {
        aurora: 'aurora 8s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};

// FILE: tailwind.config.ts (or .js)
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- REPLACE YOUR EXISTING animation/keyframes WITH THIS BLOCK ---
      animation: {
        'orbit-1': 'orbit 15s linear infinite',
        'orbit-2': 'orbit 12s linear infinite reverse',
        'orbit-3': 'orbit 9s linear infinite',
        'orbit-4': 'orbit 7s linear infinite reverse',
        'orbit-5': 'orbit 5s linear infinite',
        'orbit-6': 'orbit 4s linear infinite reverse',
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '1',
          },
        }
      },
      // --- END OF BLOCK ---
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;