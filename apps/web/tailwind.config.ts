import type { Config } from 'tailwindcss';

// Light & vibrant "digital transformation" system: digital-indigo + aurora
// gradients (violet / fuchsia / cyan), glassmorphism, smooth motion.
// Fonts: Space Grotesk (display) + DM Sans (body).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Digital indigo scale (Tailwind indigo) — primary brand.
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Vibrant violet accent for highlights.
        accent: {
          soft: '#F5F3FF',
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Space Grotesk', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)',
        lift: '0 24px 60px -20px rgba(49,46,129,0.30)',
        glow: '0 0 0 1px rgba(99,102,241,0.10), 0 18px 50px -16px rgba(99,102,241,0.55)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        content: '74rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(28px, -38px) scale(1.12)' },
          '66%': { transform: 'translate(-22px, 18px) scale(0.94)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        blob: 'blob 16s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        gradient: 'gradient 8s ease infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
