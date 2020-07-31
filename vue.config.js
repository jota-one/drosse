const styleVariables = require('./src/styles/variables.json')

module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-nested')(),
          require('postcss-css-variables')({
            variables: { ...styleVariables }
          })
        ]
      }
    }
  },
  devServer: {
    proxy: {
      '/drosse': {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      }
    }
  }
}