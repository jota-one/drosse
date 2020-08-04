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
    proxy: {
      '/drosse': {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      },
      '/drosses': {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      },
      '/file': {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      }
    }
  }
}