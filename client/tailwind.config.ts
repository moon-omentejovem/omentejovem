import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FF692C',
          100: '#ff5a18'
        },
        secondary: {
          50: '#EBEBEB',
          100: '#B1B1B1',
          200: '#2B2B2B'
        },
        background: '#F0F1F1'
      },
      fontFamily: {
        heading: 'var(--font-neuemachina)',
        body: 'var(--font-fraktion)'
      },
      height: {
        header: '6.5rem',
        screenMinusHeader: 'calc(100vh - 104px)'
      },
      minHeight: {
        screenMinusHeader: 'calc(100vh - 104px)'
      },
      screens: {
        '3xl': '2350px'
      }
    }
  },
  plugins: []
}
export default config
