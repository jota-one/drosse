require('yargs')
  .usage('Usage: $0 <cmd> [args]')
  .commandDir('../cmd')
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv
