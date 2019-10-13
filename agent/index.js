const config = require('./config/config');
const startAgent = require('./src/agent');

console.table(config);

startAgent(config);
