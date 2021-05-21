const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',
  purge: {
    content: ['_site/**/*.html'],
    options: {
      safelist: [],
    },
  },
  theme: {
    extend: {
      colors: {
        gray: colors.gray,
        green: colors.green,
      },
    },
  },
  variants: {},
  plugins: [],
}
