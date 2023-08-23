module.exports = {
  entries: ['./src/index'],
  clean: true,
  // declaration: true,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
}
