const Loki = require('lokijs')
const lodash = require('lodash')
const path = require('path')
const useState = require('./useState')
const logger = require('../logger')

let db

module.exports = function () {
  const state = useState()
  const defineCollectionsList = () => {
    const readdirp = require('readdirp')
    const streamToPromise = require('stream-to-promise')

    return streamToPromise(readdirp(path.join(state.get('root'), state.get('collectionsPath')), {
      fileFilter: ['*.json']
    }))
  }

  const loadContents = async () => {
    const fs = require('fs').promises
    const dirname = path.join(state.get('root'), state.get('collectionsPath'))

    const res = await defineCollectionsList()
    const collectionList = lodash.chain(res)
      .map(file => file.path.split(path.sep).slice(0, -1).join(path.sep))
      .uniq()
      .map(file => file.split(path.sep).join('.'))
      .value()

    return Promise.all(collectionList.map((name) => {
      let coll = db.getCollection(name)

      if (coll) {
        logger.warn('collection:', name, 'already exists.')
        return false
      }
      coll = db.addCollection(name)

      const filesPath = path.join(dirname, name.split('.').join(path.sep))
      return fs.readdir(filesPath)
        .then(function (filenames) {
          return Promise.all(filenames.map(function (filename) {
            return fs.readFile(path.join(filesPath, filename), 'utf-8')
              .then(function (content) {
                logger.success('loaded', filename, 'into collection', name)
                return coll.insert(JSON.parse(content))
              })
          }))
        })
    }))
  }

  return {
    loadDb: function () {
      return new Promise((resolve, reject) => {
        try {
          db = new Loki(path.join(state.get('root'), state.get('database')), {
            autosave: true,
            autosaveInterval: 4000,
            autoload: true,
            autoloadCallback: () => {
              loadContents()
                .then(() => resolve(db))
            }
          })
        } catch (e) { reject(e) }
      })
    },

    /**
     * Database getter
     *
     * @returns {Loki}
     */
    get: function () {
      return db
    },

    /**
     * Collection getter (or creator)
     *
     * @param {String} name
     * @returns {Collection}
     */
    collection: function (name) {
      let coll = db.getCollection(name)
      if (!coll) {
        coll = db.addCollection(name)
      }
      return coll
    }
  }
}
