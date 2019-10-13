const express = require('express');
const fetch = require('node-fetch');

const loaders = require('./loaders');

module.exports = async function StartAgent({
  serverHost,
  serverPort,
  host,
  port,
  ...opts
}) {
  const app = express();

  await loaders({ app, serverHost, serverPort, ...opts });

  app.listen(port, host, err => {
    if (err) {
      console.error(err);
      process.exit(1);
      return;
    }
    console.log(`Agent running on http://${host}:${port}`);

    fetch(`http://${serverHost}:${serverPort}/notify_agent`, {
      method: 'POST',
      body: JSON.stringify({ host, port }),
      headers: { 'Content-Type': 'application/json' },
    }).then(
      async res => {
        if (res.status < 200 || res.status >= 300) {
          console.error(await res.json());
          process.exit(1);
        }
      },
      err => {
        console.error(err);
        // process.exit(1);
      }
    );
  });
};
