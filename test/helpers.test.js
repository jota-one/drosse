import { describe, expect, it } from 'vitest'
import {
  cloneDeep,
  curry,
  get,
  isEmpty,
  merge,
  omit,
  pick,
  set
} from '../src/helpers'

describe('helpers', () => {
  it('gets value from an object located at a given path', () => {
    const obj = { a:1, b:2, c: { d:3, e: [4,5] } }
    expect(get(obj, 'a')).toBe(1)
    expect(get(obj, 'c.d')).toBe(3)
    expect(get(obj, 'c.e.0')).toBe(4)
    expect(get(obj, 'c.e.[1]')).toBe(5)
  })

  it('sets value to an object located at a given path', () => {
    const obj = { a:1 , b:2}
    set(obj, 'b', 3)
    set(obj, 'c', { d:4 })
    expect(obj).toMatchObject({ a:1, b:3, c: { d:4 } })
  })

  it('returns true if an object is empty', () => {
    expect(isEmpty({})).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(null)).toBe(true)
  })

  it('curries a function', () => {
    const greetings = (greet,gender,name) => `${greet} ${gender} ${name}!`
    const hello = curry(greetings)('Hello')
    const helloMrs = curry(hello)('Mrs')

    expect(hello('Mrs', 'Robinson')).toBe('Hello Mrs Robinson!')
    expect(helloMrs('Robinson')).toBe('Hello Mrs Robinson!')
  })

  it('omits keys from object, returning a new object', () => {
    const obj = {
      a:1, b:2, DROSSE: 3, $loki: 4, salut: 5, adjeu: {
        DROSSE: 6, $loki: 7, yo: ['yo1', 'yo2']
      }
    }
    const toOmit = ['DROSSE', '$loki', 'adjeu.DROSSE']

    expect(omit(obj, toOmit)).toStrictEqual(
      { a:1, b:2, salut: 5, adjeu: { yo: ['yo1', 'yo2'] } }
    )
    expect(omit([obj], toOmit)).toStrictEqual(
      [{ a:1, b:2, salut: 5, adjeu: { yo: ['yo1', 'yo2'] } }]
    )

    const dbUsers = [
      {
        "name": "Tadai",
        "powers": [
          {
            "name": "guitar",
            "description": "Can play the guitar",
            "level": 2,
            "DROSSE": {
              "ids": [
                "guitar"
              ]
            },
            "meta": {
              "revision": 0,
              "created": 1671445321089,
              "version": 0
            }
          }
        ],
        "DROSSE": {
          "ids": [
            "tadai",
            "1"
          ]
        },
        "meta": {
          "revision": 0,
          "created": 1671533782070,
          "version": 0
        }
      },
      {
        "name": "Jorinho",
        "DROSSE": {
          "ids": [
            "jorinho",
            "2"
          ]
        },
        "meta": {
          "revision": 0,
          "created": 1671533782073,
          "version": 0
        },
        "powers": [

        ]
      }
    ]

    expect(omit(dbUsers, ['DROSSE', 'meta', '$loki'])).toStrictEqual(
      [{
        name: 'Tadai',
        powers: [{
          name: 'guitar',
          description: 'Can play the guitar',
          level: 2
        }]
      }, {
        name: 'Jorinho',
        powers: []
      }]
    )
  })

  it('picks keys from an object, returning a new object', () => {
    const obj = {a:1, b:2, c: { d: { e: 3, f: [4,5] }}}
    const toPick = ['a', 'c.d.e', 'c.d.f.[0]']

    expect(pick(obj, toPick)).toStrictEqual(
      { a: 1, c: { d: { e: 3, f: [4] } } }
    )
  })

  it.todo('deep-clones an object', () => {

  })

  it.todo('merges 2 objects', () => {

  })
})