const { existsSync } = require('fs');

const defaultCfg = {
  host: '0.0.0.0',
  port: '3000',
};

const env = process.env.NODE_ENV;
const envCfgPath = `${env}.json`;
let envCfg = {};
if (env && existsSync(envCfgPath)) {
  envCfg = require(envCfgPath);
}

const config = Object.assign({}, defaultCfg, envCfg);

config.repo = process.argv[2] || config.repo;
config.port = Number.parseInt(process.argv[3] || config.port);

module.exports = config;
