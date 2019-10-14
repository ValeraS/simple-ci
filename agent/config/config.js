const { existsSync } = require('fs');
const { resolve } = require('path');

const defaultCfg = {
  host: '0.0.0.0',
  port: '8000',
  agentHost: '127.0.0.1',
  agentPort: '8000',
  serverHost: '127.0.0.1',
  serverPort: '3000',
  buildPath: '.',
};

const env = process.env.NODE_ENV;
const envCfgPath = `${env}.json`;
let envCfg = {};
if (env && existsSync(envCfgPath)) {
  envCfg = require(envCfgPath);
}

const config = Object.assign({}, defaultCfg, envCfg);

config.serverHost = process.argv[2] || config.serverHost;
config.serverPort = Number.parseInt(process.argv[3] || config.serverPort);
config.agentHost = process.argv[4] || config.agentHost;
config.agentPort = Number.parseInt(process.argv[5] || config.agentPort);
config.buildPath = resolve(process.argv[6] || config.buildPath);

module.exports = config;
