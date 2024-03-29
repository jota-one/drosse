import { promises as fs } from 'fs'
import { join, sep } from 'path'

import Loki from 'lokijs'
import { cloneDeep, get, set, omit } from '../../helpers'
import { async as rrdir } from 'rrdir'

import config from '../config'
import logger from '../logger'

import useState from './useState'

let db

export default function useDB() {
  const state = useState()

  const collectionsPath = () =>
    join(state.get('root'), state.get('collectionsPath'))

    const normalizedPath = filePath =>
    filePath.replace(collectionsPath(), '').substr(1)

  const loadAllMockFiles = async () => {
    const res = await rrdir(collectionsPath())
    return res
      .filter(entry => !entry.directory && entry.path.endsWith('json'))
      .map(entry => {
        entry.path = normalizedPath(entry.path)
        return entry
      })
  }

  const handleCollection = (name, alreadyHandled, newCollections) => {
    const shallowCollections = state.get('shallowCollections')
    const coll = db.getCollection(name)

    if (coll) {
      if (newCollections.includes(name)) {
        return coll
      }

      if (!shallowCollections.includes(name)) {
        if (alreadyHandled.includes(name)) {
          return false
        }
        logger.warn(
          '📦 collection',
          name,
          "already exists and won't be overriden."
        )
        alreadyHandled.push(name)
        return false
      }

      if (alreadyHandled.includes(name)) {
        return coll
      }
      logger.warn(
        '🌊 collection',
        name,
        'already exists and will be overriden.'
      )
      db.removeCollection(name)
      alreadyHandled.push(name)
    }

    newCollections.push(name)
    return db.addCollection(name)
  }

  const loadContents = async () => {
    const files = await loadAllMockFiles()
    const handled = []
    const newCollections = []

    for (const entry of files) {
      const filename = entry.path.split(sep).pop()
      const fileContent = await fs.readFile(
        join(collectionsPath(), entry.path),
        'utf-8'
      )
      const content = JSON.parse(fileContent)
      const collectionName = Array.isArray(content)
        ? entry.path.slice(0, -5).split(sep).join('.')
        : entry.path.split(sep).slice(0, -1).join('.')
      const coll = handleCollection(collectionName, handled, newCollections)
      if (coll) {
        coll.insert(content)
        logger.success(`loaded ${filename} into collection ${collectionName}`)
      }
    }
  }

  const clean = (...fields) => result =>
    omit(result, config.db.reservedFields.concat(fields || []))

  const service = {
    loadDb() {
      return new Promise((resolve, reject) => {
        try {
          const AdapterName = state.get('dbAdapter')
          const adapter = Loki[AdapterName]
            ? new Loki[AdapterName]()
            : new AdapterName()
          db = new Loki(join(state.get('root'), state.get('database')), {
            adapter,
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

      where(collection, searchFn, cleanFields = []) {
        const coll = service.collection(collection)
        return coll
          .chain()
          .where(searchFn)
          .data()
          .map(clean(...cleanFields))
      },
    },

    get: {
      byId(collection, id, cleanFields = []) {
        const coll = service.collection(collection)
        return clean(...cleanFields)(
          coll.findOne({ 'DROSSE.ids': { $contains: id } })
        )
      },

      byRef(refObj, dynamicId, cleanFields = []) {
        const { collection, id: refId } = refObj
        const id = dynamicId || refId
        return {
          ...this.byId(collection, id, cleanFields),
          ...omit(refObj, ['collection', 'id']),
        }
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
        return clean(...cleanFields)(coll.findOne(query))
      },

      where(collection, searchFn, cleanFields = []) {
        const result = service.list.where(collection, searchFn, cleanFields)
        if (result.length > 0) {
          return result[0]
        }
        return null
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
      return coll.insert(cloneDeep({ ...payload, DROSSE: { ids } }))
    },

    update: {
      byId(collection, id, newValue) {
        const coll = service.collection(collection)

        coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
          Object.entries(newValue).forEach(([key, value]) => {
            set(doc, key, value)
          })
        })
      },

      subItem: {
        append(collection, id, subPath, payload) {
          const coll = service.collection(collection)
          coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
            if (!get(doc, subPath)) {
              set(doc, subPath, [])
            }
            get(doc, subPath).push(payload)
          })
        },
        prepend(collection, id, subPath, payload) {
          const coll = service.collection(collection)
          coll.findAndUpdate({ 'DROSSE.ids': { $contains: id } }, doc => {
            if (!get(doc, subPath)) {
              set(doc, subPath, [])
            }
            get(doc, subPath).unshift(payload)
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
