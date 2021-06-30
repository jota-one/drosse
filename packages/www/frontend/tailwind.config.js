const colors = require('tailwindcss/colors')

module.exports = {
    purge: [],
    darkMode: 'class',
    theme: {
        extend: {
          colors: {
            gray: colors.gray,
            green: colors.green,
          },
        },
      },
    variants: {
      extend: {},
    },
    plugins: [],
  }
  