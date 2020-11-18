const Loki = require('lokijs')
const lodash = require('lodash')
const path = require('path')
const useState = require('./state')
const logger = require('../logger')
const config = require('../config')

let db

module.exports = function () {
  const state = useState()

  const defineCollectionsList = () => {
    const readdirp = require('readdirp')
    const streamToPromise = require('stream-to-promise')

    return streamToPromise(
      readdirp(path.join(state.get('root'), state.get('collectionsPath')), {
        fileFilter: ['*.json'],
      })
    )
  }

  const loadContents = async () => {
    const fs = require('fs').promises
    const dirname = path.join(state.get('root'), state.get('collectionsPath'))
    const shallowCollections = state.get('shallowCollections')

    const res = await defineCollectionsList()
    const collectionList = lodash
      .chain(res)
      .map(file => file.path.split(path.sep).slice(0, -1).join(path.sep))
      .uniq()
      .map(file => file.split(path.sep).join('.'))
      .value()

    return Promise.all(
      collectionList.map(name => {
        let coll = db.getCollection(name)

        if (coll) {
          if (!shallowCollections.includes(name)) {
            logger.warn(
              'collection:',
              name,
              "already exists and won't be overriden."
            )
            return false
          } else {
            logger.warn(
              'collection:',
              name,
              'already exists and will be overriden.'
            )
            db.removeCollection(name)
          }
        }
        coll = db.addCollection(name)

        const filesPath = path.join(dirname, name.split('.').join(path.sep))
        return fs.readdir(filesPath).then(filenames =>
          Promise.all(
            filenames
              .filter(filename => filename.endsWith('json'))
              .map(filename =>
                fs
                  .readFile(path.join(filesPath, filename), 'utf-8')
                  .then(content => {
                    logger.success(`loaded ${filename} into collection ${name}`)
                    return coll.insert(JSON.parse(content))
                  })
              )
          )
        )
      })
    )
  }

  const clean = (...fields) => result =>
    lodash.omit(result, config.db.reservedFields.concat(fields || []))

  const service = {
    loadDb: function () {
      return new Promise((resolve, reject) => {
        try {
          db = new Loki(path.join(state.get('root'), state.get('database')), {
            autosave: true,
            autosaveInterval: 4000,
            autoload: true,
            autoloadCallback: () => {
              loadContents().then(() => resolve(db))
            },
          })
        } catch (e) {
          reject(e)
        }
      })
    },

    /**
     * Database getter
     *
     * @returns {Loki}
     */
    loki: function () {
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
    },

    list: {
      all(collection, cleanFields = []) {
        const coll = service.collection(collection)
        return coll.data.map(clean(...cleanFields))
      },

      byId(collection, id, cleanFields = []) {
        const coll = service.collection(collection)
        return coll
          .find({ 'DROSSE.ids': { $contains: id } })
          .map(clean(...cleanFields))
      },

      byField(collection, field, value, cleanFields = []) {
        return this.byFields(collection, [field], value, cleanFields)
      },

      byFields(collection, fields, value, cleanFields = []) {
        return this.find(
          collection,
          {
            $or: fields.map(field => ({
              [field]: { $contains: value },
            })),
          },
          cleanFields
        )
      },

      find(collection, query, cleanFields = []) {
        const coll = service.collection(collection)
        return coll
          .chain()
          .find(query)
          .data()
          .map(clean(...cleanFields))
      },
    },

    get: {
      byId(collection, id) {
        const coll = service.collection(collection)
        return clean()(coll.findOne({ 'DROSSE.ids': { $contains: id } }))
      },

      byRef(refObj, dynamicId) {
        const { collection, id: refId } = refObj
        const id = dynamicId || refId
        return {
          ...lodash.omit(refObj, ['collection', 'id']),
          ...this.byId(collection, id),
        }
      },

      byField(collection, field, value) {
        return this.byFields(collection, [field], value)
      },

      byFields(collection, fields, value) {
        return this.find(collection, {
          $or: fields.map(field => ({
            [field]: { $contains: value },
          })),
        })
      },

      find(collection, query) {
        const coll = service.collection(collection)
        return coll.chain().findOne(query).data().map(clean())
      },
    },

    query: {
      getIdMap(collection, fieldname, firstOnly = false) {
        const coll = service.collection(collection)
        return coll.data.reduce(
          (acc, item) => ({
            ...acc,
            [item[fieldname]]: firstOnly ? item.DROSSE.ids[0] : item.DROSSE.ids,
          }),
          {}
        )
      },

      chain(collection) {
        return service.collection(collection).chain()
      },

      clean,
    },

    insert(collection, ids, payload) {
      const coll = service.collection(collection)
      return coll.insert(lodash.cloneDeep({ ...payload, DROSSE: { ids } }))
    },

    update: {
      byId(collection, id, newValue) {
        const coll = service.collection(collection)

        coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
          Object.entries(newValue).forEach(([key, value]) => {
            doc[key] = value
          })
        })
      },

      subItem: {
        append(collection, id, subPath, payload) {
          const coll = service.collection(collection)
          coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
            if (!lodash.get(doc, subPath)) {
              lodash.set(doc, subPath, [])
            }
            lodash.get(doc, subPath).push(payload)
          })
        },
        prepend(collection, id, subPath, payload) {
          const coll = service.collection(collection)
          coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
            if (!lodash.get(doc, subPath)) {
              lodash.set(doc, subPath, [])
            }
            lodash.get(doc, subPath).unshift(payload)
          })
        },
      },
    },

    remove: {
      byId(collection, id) {
        const coll = service.collection(collection)
        const toDelete = coll.findOne({ 'DROSSE.ids': { $contains: id } })
        return toDelete && coll.remove(toDelete)
      },
    },
  }
  return service
}
