import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: 'var(--primary-color)',
      secondary: 'var(--secondary-color)',
      accent: 'var(--accent-color)',
      textMain: 'var(--text-main)',
      textSecondary: 'var(--text-secondary)',
      glassBg: 'var(--glass-bg)'
    }
  },
  shortcuts: {
    'glass-card': 'backdrop-blur-md bg-glassBg rounded-2xl border border-white/20 shadow-lg',
    'neon-glow': 'shadow-[0_0_15px_rgba(99,102,241,0.5)]',
    'btn-primary':
      'px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95'
  }
})
