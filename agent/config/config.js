const { existsSync } = require('fs');
const { resolve } = require('path');

const defaultCfg = {
  host: '0.0.0.0',
  port: '8000',
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
config.port = Number.parseInt(process.argv[4] || config.port);
config.buildPath = resolve(process.argv[5] || config.buildPath);

module.exports = config;
