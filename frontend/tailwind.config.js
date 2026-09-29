/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand — deep amber/gold
        primary: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Gold accent
        gold: {
          50:  '#fdfdf0',
          100: '#faf9d4',
          200: '#f5f0a8',
          300: '#ede272',
          400: '#e2ce3e',
          500: '#d4b820',
          600: '#b89516',
          700: '#946f14',
          800: '#7a5817',
          900: '#684a18',
        },
        // Dark backgrounds
        dark: {
          50:  '#f8f7f4',
          100: '#f0ede6',
          200: '#e2dcd0',
          300: '#ccc3b2',
          400: '#b3a590',
          500: '#9d8d74',
          600: '#8a7762',
          700: '#726252',
          800: '#5e5045',
          900: '#4e433b',
          950: '#1a1410',
        },
        // Charcoal for cards/surfaces
        charcoal: {
          50:  '#f6f6f5',
          100: '#e7e6e4',
          200: '#d2cfcb',
          300: '#b5b0aa',
          400: '#948d85',
          500: '#7a736a',
          600: '#675f57',
          700: '#564e47',
          800: '#49433c',
          900: '#3f3934',
          950: '#1c1714',
        },
        cream: '#fdf8f0',
        ivory: '#fefcf7',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #1a1410 0%, #2d2016 50%, #1a1410 100%)',
        'gold-gradient':   'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)',
        'card-gradient':   'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-gradient':   'linear-gradient(135deg, #0f0a06 0%, #1e1208 40%, #2d1f0e 70%, #1a1208 100%)',
      },
      boxShadow: {
        'luxury':    '0 8px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
        'gold':      '0 4px 20px rgba(217,119,6,0.35)',
        'card':      '0 2px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
        'glass':     '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-gold':'inset 0 1px 0 rgba(245,158,11,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'shimmer':    'shimmer 2s infinite',
        'float':      'float 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 10px rgba(245,158,11,0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(245,158,11,0.7)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
