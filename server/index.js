const config = require('./config/config');
const startServer = require('./src/server');

console.table(config);

startServer(config);
