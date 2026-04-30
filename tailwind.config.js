/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all source files for used class names
  content: [
    "./index.html",
    "./original.html",
    "./js/**/*.js",
    "./js/templates/**/*.js",
  ],
  // Safelist dynamic classes that are built via string concatenation at runtime
  safelist: [
    // Rarity glow classes (built dynamically from art.rarity.toLowerCase())
    'glow-common', 'glow-rare', 'glow-epic', 'glow-legendary', 'glow-artifact',
    // Animation classes applied via JS
    'fx-entrance-pop', 'fx-entrance-left', 'fx-entrance-right',
    'fx-modal-entrance', 'fx-class-card-entrance', 'fx-class-selected',
    'fx-descend', 'pull-up', 'animate-spin', 'animate-pulse',
    // Dynamic text color / border classes from rarityColor lookups
    { pattern: /^text-(rose|amber|purple|indigo|slate|white|emerald|blue|red)-(400|500|600|700|800|900)$/ },
    { pattern: /^border-(rose|amber|purple|indigo|slate|white|emerald|blue|red)-(400|500|600|700|800|900)$/ },
    { pattern: /^bg-(rose|amber|purple|indigo|slate|white|emerald|blue|red)-(400|500|600|700|800|900|950)$/ },
    { pattern: /^shadow-(rose|amber|purple|indigo|slate|emerald|blue|red)-(950|900)\/\d+$/ },
    // Grayscale and opacity utilities used in disabled states
    'grayscale-[0.5]', 'cursor-not-allowed', 'opacity-60',
    // Animation delay inline styles (handled as inline, not class, so safe)
    // Hide utility
    'hide', 'hidden',
    // Grid and sizing
    { pattern: /^grid-cols-\d+$/ },
    { pattern: /^col-span-\d+$/ },
    // Flexbox
    'flex', 'flex-col', 'flex-row', 'flex-grow', 'flex-wrap', 'shrink-0', 'items-center', 'justify-between', 'justify-center', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
