const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'media',
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
