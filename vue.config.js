const endpoints = require('./src/config/endpoints')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-nested')()
        ]
      }
    }
  },
  chainWebpack: config => {
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      config.pluginOptions && config.pluginOptions.monaco
    ])
  },
  devServer: {
    proxy: Object.values(endpoints).reduce((targets, path) => {
      targets[path] = {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      }
      return targets
    }, {})
  }
}