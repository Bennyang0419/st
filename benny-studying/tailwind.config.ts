import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        surface: {
          50:  'rgba(255,255,255,0.03)',
          100: 'rgba(255,255,255,0.06)',
          200: 'rgba(255,255,255,0.09)',
          300: 'rgba(255,255,255,0.12)',
          400: 'rgba(255,255,255,0.18)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover:   'rgba(255,255,255,0.14)',
          strong:  'rgba(255,255,255,0.20)',
        },
        accent: {
          blue:   '#4C8EFF',
          indigo: '#7B6FEE',
          teal:   '#38C9A4',
          amber:  '#F5A623',
        },
        slate: {
          850: '#111827',
          900: '#0D1117',
          950: '#080D14',
        },
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-hover': 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
        'aurora-morning':  'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,179,237,0.15) 0%, transparent 60%)',
        'aurora-afternoon':'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(167,139,250,0.12) 0%, transparent 60%)',
        'aurora-evening':  'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251,146,60,0.12) 0%, transparent 60%)',
        'aurora-night':    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.10) 0%, transparent 60%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        glow: '0 0 20px rgba(76,142,255,0.25)',
        'glow-teal': '0 0 20px rgba(56,201,164,0.25)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'aurora-shift': 'auroraShift 30s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%':       { transform: 'scale(1.15)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        auroraShift: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
