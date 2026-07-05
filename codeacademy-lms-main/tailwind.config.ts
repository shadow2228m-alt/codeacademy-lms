import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 30px rgba(0,255,255,0.18)',
        'neon-red': '0 0 30px rgba(239,68,68,0.35)',
      },
      colors: {
        ca: {
          bg: '#05070f',
          cyan: '#00ffff',
          fuchsia: '#d946ef',
        }
      }
    },
  },
  plugins: [],
}
export default config
