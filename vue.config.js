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
  devServer: {
    proxy: {
      '/drosse': {
        target: `http://localhost:${process.env.VUE_APP_PORT}`
      }
    }
  }
}