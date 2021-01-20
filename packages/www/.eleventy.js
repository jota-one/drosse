const icons = require('./assets/icons.json')
const htmlmin = require('html-minifier')

const iconShortCode = ({ name, size = 25, color, cssClass }) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd" class="flex-shrink-0 ${cssClass + (color ? '' : ' fill-current')}"><path d="${icons[name]}" ${color ? 'fill="' + color + '"' : ''}/></svg>`
}

module.exports = function (config) {
  config.setUseGitIgnore(false)
  config.addWatchTarget('./_tmp/style.css'),
  config.addPassthroughCopy({
    './_tmp/style.css': './style.css',
    './assets': './assets',
    './favicon.ico': './favicon.ico'
  })

  config.addShortcode('version', () => String(Date.now()))
  config.addShortcode('icon', iconShortCode)
  config.addShortcode('more', url => `<a class="more" href="${url}" target="_blank" title="more info" aria-label="more info">More info ${iconShortCode({ name: 'arrow-right', size:20 })}</a>`)

  config.addTransform("htmlmin", (content, outputPath) => {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })
    }
    return content
  })
}