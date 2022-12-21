import lodash from 'lodash'

const curry1 = lodash.curry
const curry2 = fn => (...args) => fn.bind(null, ...args)

const greetings = (greet,gender,name) => `${greet} ${gender} ${name}!`
const hello1 = curry1(greetings)('Hello')
const helloMrs1 = curry1(greetings)('Hello')('Mrs')

const hello2 = curry1(greetings)('Hello')
const helloMrs2 = curry1(greetings)('Hello')('Mrs')

console.log('curry1')
console.log(hello1('Mrs', 'Robinson'))
console.log(helloMrs1('Robinson'))
console.log()
console.log('curry2')
console.log(hello2('Mrs', 'Robinson'))
console.log(helloMrs2('Robinson'))
console.log()
