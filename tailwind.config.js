/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        system: {
          bg: '#02040a',
          panel: '#0a1424',
          border: '#1a3a5c',
          glow: '#00d4ff',
          cyan: '#00f0ff',
          blue: '#0099ff',
          deep: '#004466',
          text: '#b8e6ff',
          dim: '#4a7a9c',
          dark: '#030814',
        },
        mature: {
          bg: '#0a0204',
          panel: '#240a0a',
          border: '#5c1a1a',
          glow: '#ff2a4a',
          red: '#ff0033',
          text: '#ffb8c8',
          dim: '#9c4a4a',
        },
      },
      fontFamily: {
        system: ['Orbitron', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'flicker': 'flicker 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'border-flow': 'borderFlow 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.4' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.6' },
          '97%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      boxShadow: {
        'system-glow': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'system-inner': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
        'mature-glow': '0 0 20px rgba(255, 42, 74, 0.3), 0 0 40px rgba(255, 42, 74, 0.1)',
      },
    },
  },
  plugins: [],
};
