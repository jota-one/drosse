module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['standard', 'eslint:recommended'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': 0,
    'space-before-function-paren': 0,
  },
  plugins: ['prettier'],
}
