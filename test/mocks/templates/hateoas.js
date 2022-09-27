module.exports = {
  hateoas: function(response) {
    return {
      ...response,
      links: [{
        rel: 'link1',
        href: 'http://somehost/link/1'
      }]
    }
  },
  hal: function(response) {
    return {
      ...response,
      _links: {
        link1: {
          href: 'http://somehost/link/1'
        }
      }
    }
  }
}