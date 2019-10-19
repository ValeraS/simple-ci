const config = require('./config/config');
const startServer = require('./src/server');

console.table(config);

if (!config.repo) {
  console.log('Repo should be provided.');
  process.exit(1);
}

startServer(config);
