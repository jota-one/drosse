module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/standard',
    '@vue/prettier',
  ],
  parserOptions: {
    // Needed for dynamic imports
    // => https://stackoverflow.com/questions/47815775/dynamic-imports-for-code-splitting-cause-eslint-parsing-error-import
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 8,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-v-html': 0,
    'vue/no-v-html': 0,
  },
  plugins: ['prettier'],
}
