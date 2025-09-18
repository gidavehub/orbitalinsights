// FILE: tailwind.config.ts

const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      animation: {
        'bg-pan': 'bg-pan 30s linear infinite',
        'spin-slow': 'spin 3s linear infinite', // A slower spin for the modal
        // NEW: Centralized, performant orbit animations
        orbit: 'orbit var(--duration) linear infinite',
      },
      keyframes: {
        // NEW: Core orbit keyframe
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Grid background pan
        'bg-pan': {
          '0%': { backgroundPosition: '0px 0px' },
          '100%': { backgroundPosition: '64px 64px' },
        }
      },
    },
  },
  plugins: [],
};
export default config;