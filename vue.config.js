const styleVariables = require('./src/styles/variables.json')
const Discover = require('node-discover')

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
        target: 'http://localhost:9999'
      }
    }
  }
}