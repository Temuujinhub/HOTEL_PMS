import type { Config } from 'tailwindcss';

// Design system: Minimalism / Swiss — navy + gold hospitality palette, Inter,
// high-contrast neutral text, restrained accents, subtle neutral shadows.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF4FB',
          100: '#DBE5F3',
          200: '#BBCDE8',
          300: '#8EAAD6',
          400: '#5B80BE',
          500: '#3A5FA0',
          600: '#274A85',
          700: '#1E3A6E',
          800: '#1B2F57',
          900: '#16243F',
        },
        // Refined hospitality gold — used sparingly for accents.
        accent: {
          soft: '#FBF1DA',
          DEFAULT: '#A16207',
          dark: '#854D0E',
        },
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Subtle, neutral elevation — minimalism favors hairlines over heavy shadows.
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        lift: '0 16px 40px -16px rgba(15,23,42,0.20)',
        ring: '0 0 0 1px rgba(15,23,42,0.06)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
